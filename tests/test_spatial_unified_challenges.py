from shutil import which
"""Real-browser acceptance: the six unified spatial labs keep their 18 Challenges useful.

Experimental comparisons are two *descriptive snapshots of the same points*, not
Monte Carlo replicates.  Only an explicit record action creates a comparison sample.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text()
LABS=['moran','lisa','processi-puntuali','variogrammi','kriging','regressione-spaziale']
FOCUS={
 'moran':'Vicini kNN','lisa':'Vicini kNN',
 'processi-puntuali':'Larghezza del kernel KDE',
 'variogrammi':'Classi del variogramma',
 'kriging':'Range assunto',
 'regressione-spaziale':'Previsione cartografica',
}
def wait_ready(card, lid):
  """React to browser animation frames instead of sampling transient DOM text.

  Challenges paint their activity label in requestAnimationFrame. In CI the
  preceding click may have recorded the evidence while that paint is pending.
  Playwright's auto-retrying expectation checks the actual final state without
  skipping any experimental requirement.
  """
  activity=card.locator('.challenge-activity')
  expect(activity).to_contain_text('Esperimento pronto', timeout=10000)
  return activity.inner_text()

with sync_playwright() as p:
  browser=p.chromium.launch(headless=True, executable_path=which('chromium') or which('google-chrome') or None, args=['--no-sandbox','--disable-dev-shm-usage'],
      **({'executable_path':'/usr/bin/chromium'} if Path('/usr/bin/chromium').exists() else {}))
  try:
    for lid in LABS:
      page=browser.new_page(viewport={'width':1024,'height':850})
      errors=[]
      page.on('pageerror',lambda e:errors.append(str(e)))
      page.set_content(HTML,wait_until='domcontentloaded')
      page.evaluate('(id)=>location.hash="#/"+id',lid)
      studio=page.locator('.spatial-studio')
      studio.wait_for(timeout=20000)
      cards=page.locator('.challenge-card')
      assert cards.count()==3, (lid,'missing challenge')

      # Advanced: one explicitly recorded measurement for each of two settings.
      advanced=cards.nth(2)
      advanced.locator('summary').click()
      chosen=page.locator('.spatial-studio-field').filter(has_text=FOCUS[lid]).locator('select')
      current=chosen.input_value()
      choices=chosen.locator('option').evaluate_all('(els)=>els.map(e=>e.value)')
      replacement=next(v for v in choices if v!=current)
      if lid!='kriging':
        page.get_by_role('button',name='Registra questa configurazione').click()
        # The initial configuration is *one* observation, not a ready A/B comparison.
        page.wait_for_function('(lab)=>SA.challenges.traces[lab].samples.length===1', arg=lid)
      chosen.select_option(replacement)
      if lid!='kriging':
        # Changing the setting without recording B must still be insufficient.
        expect(advanced.locator('.challenge-activity')).to_contain_text('Registra il risultato A', timeout=10000)
        page.get_by_role('button',name='Registra questa configurazione').click()
        # Verify that two independently triggered recording actions were counted.
        page.wait_for_function('(lab)=>SA.challenges.traces[lab].samples.length===2', arg=lid)
      activity=wait_ready(advanced, lid)
      conceptual=page.evaluate('(id)=>SA.challenges.bank[id][2].correct',lid)
      advanced.locator('.challenge-answers input').nth(conceptual).check()
      if lid!='kriging':
        trace=page.evaluate('(id)=>SA.challenges.traces[id]',lid)
        assert len(trace['samples'])==2, (lid,trace['samples'])
        vals=[s['metric']['value'] for s in trace['samples']]
        assert all(isinstance(v,(int,float)) for v in vals), (lid,vals)
        # UI shows 4 decimal places; equality at displayed precision is acceptable.
        numeric=2 if f'{vals[0]:.4f}'==f'{vals[1]:.4f}' else (0 if vals[0]>vals[1] else 1)
        advanced.locator('.challenge-observation input').nth(numeric).check()
        table=advanced.locator('.challenge-comparison')
        assert table.is_visible() and 'stesso dataset' in table.inner_text(),(lid,'comparison')
      advanced.get_by_role('button',name='Verifica la sfida').click()
      assert advanced.locator('.challenge-feedback.success').count()==1,(lid,advanced.locator('.challenge-feedback').inner_text())
      print('PASS',lid,'advanced challenge',flush=True)

      # Understanding: real change of the point dataset is necessary.
      first=cards.nth(0)
      first.locator('summary').click()
      first.get_by_role('button',name='Verifica la sfida').click()
      assert first.locator('.challenge-feedback.success').count()==0,(lid,'unearned success')
      tool='add' if lid in ('processi-puntuali','kriging') else 'cluster' if lid in ('moran','lisa') else 'high'
      studio.locator('[data-tool="'+tool+'"]').click()
      bg=studio.locator('[data-action="map"]')
      bounds=bg.bounding_box()
      before=int(studio.get_attribute('data-points'))
      bg.click(position={'x':bounds['width']*.85,'y':bounds['height']*.12})
      assert int(studio.get_attribute('data-points'))>before,(lid,'dataset unchanged')
      activity=wait_ready(first, lid)
      conceptual=page.evaluate('(id)=>SA.challenges.bank[id][0].correct',lid)
      first.locator('.challenge-answers input').nth(conceptual).check()
      first.get_by_role('button',name='Verifica la sfida').click()
      assert first.locator('.challenge-feedback.success').count()==1,(lid,'unsolved')
      print('PASS',lid,'understanding challenge',flush=True)

      # Application: change a relevant control, then register its result.
      middle=cards.nth(1)
      middle.locator('summary').click()
      if lid=='kriging':
        page.locator('.spatial-studio-field').filter(has_text='Superficie da vedere').locator('select').select_option('value')
        before=int(studio.get_attribute('data-points'))
        studio.locator('[data-tool="add"]').click()
        bounds=studio.locator('[data-action="map"]').bounding_box()
        studio.locator('[data-action="map"]').click(position={'x':bounds['width']*.85,'y':bounds['height']*.12})
        assert int(studio.get_attribute('data-points'))>before
      else:
        current=chosen.input_value()
        replacement=next(v for v in choices if v!=current)
        chosen.select_option(replacement)
        page.get_by_role('button',name='Registra questa configurazione').click()
      activity=wait_ready(middle, lid)
      conceptual=page.evaluate('(id)=>SA.challenges.bank[id][1].correct',lid)
      middle.locator('.challenge-answers input').nth(conceptual).check()
      middle.get_by_role('button',name='Verifica la sfida').click()
      assert middle.locator('.challenge-feedback.success').count()==1,(lid,'application unsolved',activity)
      assert not errors,(lid,errors)
      print('PASS',lid,'application challenge',flush=True)
      page.close()
  finally:
    browser.close()
