#!/usr/bin/env python3
"""Teacher UX: required PATH title is visible and actionable in IT/EN, desktop/mobile."""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')


def check(width, english):
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path=which('chromium') or which('google-chrome'),
                                     args=['--no-sandbox', '--disable-dev-shm-usage'])
        page = browser.new_page(viewport={'width': width, 'height': 900}, accept_downloads=True)
        errors = []
        downloads = []
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        page.on('download', lambda download: downloads.append(download.suggested_filename))
        page.set_content(HTML, wait_until='load')
        if english:
            page.evaluate('document.querySelector("button.lang-toggle").click()')
        page.evaluate('location.hash="#/teachers"')
        page.wait_for_selector('.teacher-builder')
        add = 'Add laboratory' if english else 'Aggiungi laboratorio'
        settings = 'Path settings' if english else 'Impostazioni del percorso'
        export_panel = 'Export / Open project' if english else 'Esporta / Apri progetto'
        export_student = 'Export student HTML' if english else 'Esporta HTML studenti'
        save = 'Save teacher JSON' if english else 'Salva progetto JSON'
        field = 'Path title' if english else 'Titolo del percorso'
        hint = 'Required to export' if english else 'Necessario per esportare'
        error = 'Enter a path title' if english else 'Inserisci un titolo'
        # Activity title is not required; only teaching-path title is.
        page.get_by_role('button', name=add).click()
        assert page.locator('.teacher-step:not([hidden]) input[aria-label]').count() >= 1
        page.get_by_role('button', name=settings).click()
        inp = page.locator(f'input[aria-label="{field}"]')
        assert inp.get_attribute('required') is not None
        assert inp.get_attribute('aria-required') == 'true'
        assert page.locator('.teacher-required-tag').is_visible()
        assert hint in page.locator('.teacher-path-title-hint').inner_text()
        assert inp.get_attribute('aria-invalid') is None
        page.keyboard.press('Escape')

        # Trying to export HTML first switches drawer, shows in-place error and focuses input.
        page.get_by_role('button', name=export_panel).click()
        page.get_by_role('button', name=export_student).click()
        assert not downloads
        assert page.locator('.teacher-ux-panel:not([hidden])').is_visible()
        assert settings in page.locator('.teacher-ux-panel-head').inner_text()
        assert page.evaluate('document.activeElement===document.querySelector(".teacher-path-title-field input")')
        assert inp.get_attribute('aria-invalid') == 'true'
        assert error in page.locator('.teacher-path-title-error').inner_text()
        assert not page.locator('.teacher-path-title-error').is_hidden()
        # Whitespace does not count as a valid title; JSON export is guarded too.
        inp.fill('   ')
        page.keyboard.press('Escape')
        page.get_by_role('button', name=export_panel).click()
        page.get_by_role('button', name=save).click()
        assert not downloads and inp.get_attribute('aria-invalid') == 'true'
        assert page.evaluate('document.activeElement===document.querySelector(".teacher-path-title-field input")')

        # Recover within the same panel, without reloading or losing the activity.
        inp.fill('Demo with required title')
        assert page.locator('.teacher-path-title-error').is_hidden()
        assert inp.get_attribute('aria-invalid') is None
        page.keyboard.press('Escape')
        assert page.locator('.teacher-ux-summary').inner_text() == 'Demo with required title'
        page.get_by_role('button', name=export_panel).click()
        with page.expect_download() as download_info:
            page.get_by_role('button', name=export_student).click()
        assert download_info.value.suggested_filename.endswith('.html')
        with page.expect_download() as download_info:
            page.get_by_role('button', name=save).click()
        assert download_info.value.suggested_filename.endswith('.json')
        assert len(downloads) == 2, downloads
        assert not errors, errors
        print(f'PASS E required path title, bilingual feedback, focus, JSON and HTML exports @ {width}px / {"EN" if english else "IT"}', flush=True)
        browser.close()


if __name__ == '__main__':
    for w in (390, 1366):
        for en in (False, True):
            check(w, en)
