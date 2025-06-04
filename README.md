# REST-webbtjänst för Restauranghantering

Detta är en REST-baserad webbtjänst byggd med Node.js, Express och SQLite som fungerar som backend för en restaurangs hemsida. Tjänsten hanterar bland annat användarinloggning, menyredigering, bordshantering, bokningar och kontaktmeddelanden från besökare.

## Funktionalitet

Webbtjänsten erbjuder följande:

- **Autentisering** via JWT för administratörer
- **Menyhantering**: Lägg till, ta bort eller redigera maträtter och drycker
- **Bordshantering**: Hantera antal bord och platser
- **Bokningar**: Besökare kan boka bord med namn, e-post, antal gäster, datum och tid
- **Kontaktformulär**: Tar emot meddelanden från besökare
- **Skyddade rutter** för admins (t.ex. `/api/editmenu`)

## Teknologier

- Node.js
- Express
- SQLite3
- JWT (JSON Web Token)
- Bcrypt
- dotenv
- body-parser
- cors

## Komma igång

### 1. Klona repot

```bash
git clone https://github.com/nathalievaster/rest-restaurant.git
cd rest-restaurant
```

### 2. Installera beroenden

### 3. Skapa env-fil

Skapa en .env-fil i rotkatalogen och lägg till följande:

PORT=3000
DATABASE=./database.sqlite
JWT_SECRET_KEY=hemlignyckel
ADMIN_PASSWORD=valfrittlösenord

### 4. Initiera databasen

Kör node install.js för att skapa databasen, administratör samt alla tabeller.

### 5. Starta servern

Kör npm run serve för att starta servern.

## API-rutter

Alla rutter är förlagda under /api. Exempel på endpoints:
* POST /api/login (Logga in som admin)
* GET /api/menu (Hämta meny)
* POST /api/bookings (Skapa en bokning)
* POST /api/messages (Skicka meddelande)

