# Theodor Buchholz — portfolio

Statyczna strona (HTML/CSS/JS, bez kompilacji). Prace i dane kontaktowe są w plikach JSON,
które można edytować ręcznie albo przez panel pod adresem **`/admin/`**.

```
index.html          strona główna (wybrane prace, o artyście, kontakt)
galeria.html        pełna galeria z filtrami
data/artworks.json  lista prac
data/site.json      e-mail, telefon, Instagram
img/prace/          zdjęcia prac
admin/              panel właściciela (Sveltia CMS)
```

## Panel właściciela (`/admin/`)

Panel zapisuje zmiany bezpośrednio w repozytorium na GitHubie (gałąź `main`),
więc po chwili są widoczne na stronie.

### Pierwsze logowanie

1. Właściciel potrzebuje konta GitHub z dostępem do repozytorium
   `rymarczyk-tomasz/Project-Crouzen` (Settings → Collaborators).
2. Utwórz token: GitHub → Settings → Developer settings → Personal access tokens →
   **Fine-grained tokens** → Generate new token.
   - Repository access: tylko `Project-Crouzen`
   - Permissions → Contents: **Read and write**
3. Otwórz `https://<adres-strony>/admin/`, kliknij **Sign In with Token** i wklej token.

Wygodniejsze logowanie przyciskiem „Zaloguj przez GitHub” wymaga postawienia
[sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) (darmowy Cloudflare Worker)
i dopisania `base_url` w `admin/config.yml`.

### Co można zrobić w panelu

- **Prace → Lista prac** — dodać pracę (zdjęcie jest automatycznie zmniejszane i zapisywane
  jako WebP), zmienić opis, cenę, dostępność, usunąć pracę, przeciągnąć, aby zmienić kolejność.
  - *Wyróżniona* — pokazuje się na stronie głównej (maks. 6).
  - *Pokaż na stronie* — wyłącz, żeby ukryć pracę bez usuwania.
  - Prace **bez zdjęcia nie są wyświetlane**.
- **Ustawienia → Dane kontaktowe** — e-mail, telefon, Instagram. Puste pola się nie wyświetlają.

### Testowanie lokalne

Strona wczytuje dane przez `fetch`, więc nie zadziała po otwarciu pliku dwuklikiem (`file://`).
Uruchom serwer, np. rozszerzenie **Live Server** w VS Code albo `npx serve`.
Panel lokalnie: otwórz `http://localhost:…/admin/` w Chrome/Edge i wybierz
**Work with Local Repository**, wskazując folder projektu — bez logowania.

## Formularz kontaktowy (FormSubmit)

Formularz jest wyłączony, dopóki w *Dane kontaktowe* nie ma adresu e-mail.

1. Wpisz e-mail w panelu i opublikuj.
2. Wyślij ze strony wiadomość testową — FormSubmit przyśle na ten adres link aktywacyjny.
   Kliknij go.
3. (Zalecane) W mailu aktywacyjnym jest losowy kod formularza — wpisz go w polu
   *Kod formularza FormSubmit*, żeby adres e-mail nie był widoczny w kodzie strony.

## Przed publikacją

- `og:image` w `index.html` i `galeria.html` — media społecznościowe wymagają pełnego adresu
  (`https://twoja-domena.pl/img/...`); po ustaleniu domeny podmień ścieżkę.
- Zdjęcie `img/artysta.jpg` (≈330 KB) warto zmniejszyć / skonwertować do WebP.
