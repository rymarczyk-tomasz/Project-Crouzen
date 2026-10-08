# Theodor Buchholz — portfolio

Statyczna strona (HTML/CSS/JS, bez kompilacji). Prace i dane kontaktowe są w plikach JSON,
które można edytować ręcznie albo przez panel pod adresem **`/admin/`**.

```text
index.html          strona (prace z filtrami i podglądem, o artyście, kontakt)
galeria.html        przekierowanie na index.html#prace (stare linki)
data/artworks.json  lista prac
data/site.json      e-mail, telefon, Instagram
img/prace/          zdjęcia prac
admin/              panel właściciela (Sveltia CMS)
```

## Panel właściciela (`/admin/`)

Panel zapisuje zmiany bezpośrednio w repozytorium na GitHubie (gałąź `dev`, z której budowany jest GitHub Pages),
więc po chwili są widoczne na stronie.

### Pierwsze logowanie

1. Właściciel potrzebuje konta GitHub z dostępem do repozytorium
   `rymarczyk-tomasz/Project-Crouzen` (Settings → Collaborators).
2. Utwórz token: GitHub → Settings → Developer settings → Personal access tokens →
   **Fine-grained tokens** → Generate new token.
   - Repository access: tylko `Project-Crouzen`
   - Permissions → Contents: **Read and write**
3. Otwórz <https://rymarczyk-tomasz.github.io/Project-Crouzen/admin/>, kliknij
   **Zaloguj się za pomocą tokenu dostępu** i wklej token.

Wygodniejsze logowanie przyciskiem „Zaloguj się przez GitHub” wymaga postawienia
[sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) (darmowy Cloudflare Worker)
i dopisania `base_url` w `admin/config.yml`.

### Panel na iPhonie

1. Otwórz adres panelu w **Safari** → przycisk *Udostępnij* → **Do ekranu początkowego**.
   Panel będzie się otwierał jak aplikacja (ikona „TB”).
2. Zaloguj się tokenem **już w tej aplikacji** (ma osobną pamięć niż Safari).
   Token zapisz w Hasłach / notatkach — przyda się, gdyby trzeba było zalogować się ponownie.
3. Zdjęcia można wybierać prosto z Galerii lub zrobić aparatem; zdjęcia z iPhone'a
   (także HEIC) są automatycznie zmniejszane i zapisywane jako WebP.

Utworzenie tokenu najwygodniej zrobić raz na komputerze.

### Co można zrobić w panelu

- **Prace → Lista prac** — dodać pracę (zdjęcie jest automatycznie zmniejszane i zapisywane
  jako WebP), zmienić opis, cenę, dostępność, usunąć pracę, przeciągnąć, aby zmienić kolejność.
  - *Wyróżniona* — obecnie nieużywane (galeria pokazuje wszystkie opublikowane prace).
  - *Pokaż na stronie* — wyłącz, żeby ukryć pracę bez usuwania.
  - Prace **bez zdjęcia nie są wyświetlane**.
- **Ustawienia → Dane kontaktowe** — e-mail, telefon, Instagram. Puste pola się nie wyświetlają.

### Testowanie lokalne

Strona wczytuje dane przez `fetch`, więc nie zadziała po otwarciu pliku dwuklikiem (`file://`).
Uruchom serwer, np. rozszerzenie **Live Server** w VS Code albo `npx serve`.
Panel lokalnie: otwórz `http://localhost:…/admin/` w Chrome/Edge i wybierz
**Pracuj z lokalnym repozytorium**, wskazując folder projektu — bez logowania.

## Formularz kontaktowy (FormSubmit)

Formularz jest wyłączony, dopóki w *Dane kontaktowe* nie ma adresu e-mail.

1. Wpisz e-mail w panelu i opublikuj.
2. Wyślij ze strony wiadomość testową — FormSubmit przyśle na ten adres link aktywacyjny.
   Kliknij go.
3. (Zalecane) W mailu aktywacyjnym jest losowy kod formularza — wpisz go w polu
   *Kod formularza FormSubmit*, żeby adres e-mail nie był widoczny w kodzie strony.

## Adres strony i własna domena

Strona: <https://rymarczyk-tomasz.github.io/Project-Crouzen/> (GitHub Pages z gałęzi `dev`).
Po podpięciu własnej domeny podmień ten adres w `og:image`, `canonical` i JSON-LD (`index.html`) oraz w `galeria.html`
oraz w `site_url` / `display_url` w `admin/config.yml`.

## Do zrobienia

- Zdjęcie `img/artysta.jpg` (≈330 KB) warto zmniejszyć / skonwertować do WebP.
