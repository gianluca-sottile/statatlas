"""User journeys for Parte VIII continuous maps: drag, cluster, controls and native synchronization."""
from pathlib import Path
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parents[1]/'index.html').read_text()
with sync_playwright() as p:
 b=p.chromium.launch(**dict(headless=True, args=['--no-sandbox','--disable-dev-shm-usage'], **({'executable_path':'/usr/bin/chromium'} if Path('/usr/bin/chromium').exists() else {})))
 try:
  page=b.new_page(viewport={'width':1200,'height':850},has_touch=True)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html)
  def openlab(lab):
   page.evaluate('(s)=>location.hash="#/"+s',lab)
   page.locator('.spatial-studio').wait_for()
   return page.locator('.spatial-studio')
  s=openlab('moran')
  assert abs(float(s.get_attribute('data-moran')))<2
  before=float(s.get_attribute('data-moran'))
  s.get_by_role('button',name='Alternanza').click()
  alternate=float(s.get_attribute('data-moran'))
  assert abs(before-alternate)>.15,(before,alternate)
  s.locator('[data-tool="cluster"]').click()
  bg=s.locator('[data-action="map"]');bbox=bg.bounding_box();count=int(s.get_attribute('data-points'))
  bg.click(position={'x':bbox['width']*.85,'y':bbox['height']*.12})
  assert int(s.get_attribute('data-points'))==count+7
  print('PASS Moran: scenario alternato + gruppo di punti correlati e cambio di I')

  s=openlab('lisa')
  assert s.locator('.spatial-studio-stat').count()>=4
  assert s.locator('svg circle[stroke="#1a73a8"]').count()+s.locator('svg circle[stroke="#d76a40"]').count()>0
  print('PASS LISA: raggruppamento e classificazioni puntuali HH/LL')

  s=openlab('processi-puntuali')
  assert s.locator('.spatial-studio-minichart svg').count()==1
  before=int(s.get_attribute('data-points'))
  s.locator('[data-tool="cluster"]').click()
  bg=s.locator('[data-action="map"]');bbox=bg.bounding_box()
  bg.click(position={'x':bbox['width']*.85,'y':bbox['height']*.12})
  assert int(s.get_attribute('data-points'))==before+9
  # The unified lab has no duplicate pattern map or legacy figure.
  assert page.locator('.spatial-studio').count()==1
  assert page.locator('.fig').count()==0
  s.locator('[data-tool="move"]').click()
  circle=s.locator('[data-point="0"]');circle.scroll_into_view_if_needed();bbox=circle.bounding_box()
  cx=bbox['x']+bbox['width']/2;cy=bbox['y']+bbox['height']/2
  old=circle.get_attribute('cx')
  page.mouse.move(cx,cy);page.mouse.down();page.mouse.move(cx+22,cy-15,steps=5);page.mouse.up()
  assert s.locator('[data-point="0"]').get_attribute('cx')!=old
  print('PASS Processi puntuali: KDE + L(r)-r, gruppo unico, spostamento col mouse')

  s=openlab('variogrammi')
  assert s.locator('.spatial-studio-minichart svg').count()==1
  initial=s.locator('.spatial-studio-minichart svg path').first.get_attribute('d')
  s.locator('[data-tool="high"]').click();bg=s.locator('[data-action="map"]');bbox=bg.bounding_box()
  bg.click(position={'x':bbox['width']*.85,'y':bbox['height']*.82})
  after=s.locator('.spatial-studio-minichart svg path').first.get_attribute('d')
  assert initial!=after
  print('PASS Variogrammi: sensore aggiunto, curva delle semivarianze aggiornata')

  s=openlab('kriging')
  old=float(s.get_attribute('data-mean-variance'))
  bg=s.locator('[data-action="map"]');bbox=bg.bounding_box()
  bg.click(position={'x':bbox['width']*.9,'y':bbox['height']*.9})
  new=float(s.get_attribute('data-mean-variance'))
  assert new<=old+1e-7,(old,new)
  assert s.get_attribute('data-points')=='13'
  assert page.locator('.fig').count()==0
  s.get_by_label('Superficie da vedere').select_option('value')
  assert s.locator('.spatial-studio-map svg').count()==1
  print('PASS Kriging: varianza ridotta, tredicesimo sensore, mappa predizione unica')

  s=openlab('regressione-spaziale')
  old=float(s.get_attribute('data-r2coords'))
  assert -.1<=old<=1.0000001
  s.get_by_role('button',name='Trend geografico').click()
  assert float(s.get_attribute('data-r2coords'))>.95
  s.get_by_label('Previsione cartografica').select_option('x')
  assert s.locator('.spatial-studio-map svg').count()==1
  print('PASS Regressione: confronto OLS X / X + coordinate e superficie')
  assert not errors,errors
 finally:b.close()
