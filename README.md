# Mi Vaca - Restaurant Bill Sharing App

A web application built with Next.js and React for sharing restaurant bills with friends. Perfect for group dinners where everyone wants to split the bill fairly!

## Features

- **Vaquer@ Dashboard**: Create a new "vaca" (bill sharing session), view products added by friends in real-time, and share payment QR codes
- **Comensal Mode**: Join a vaca via QR code, add products you're consuming, and view payment QR when ready
- **Real-time Updates**: See products being added as they happen (updates every 2 seconds)
- **Automatic Tip Calculation**: 10% tip is automatically added to the total
- **QR Code Integration**: Generate QR codes for joining and upload QR codes for payment

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### As Vaquer@ (Organizer)

1. Go to the home page and enter a name for your vaca (e.g., "Cena en el restaurante")
2. Click "Crear Nueva Vaca"
3. You'll be redirected to your dashboard where you can:
   - See the QR code to share with friends
   - View products as they're added by comensales
   - Upload a payment QR code when ready
   - See the total with automatic 10% tip

### As Comensal (Friend)

1. Scan the QR code shared by the vaquer@
2. Enter your name to join the vaca
3. Add products you're consuming:
   - Product name
   - Price from menu
   - Quantity
4. You can add multiple products
5. When the vaquer@ shares the payment QR, you'll see it on your screen

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **qrcode.react** - QR code generation
- **UUID** - Unique ID generation

## Project Structure

```
/app
  /api          - API routes
  /vaquero      - Vaquer@ dashboard pages
  /comensal     - Comensal pages
  page.tsx      - Home page
/lib            - Store and utilities
/types          - TypeScript type definitions
```

## Notes

- The app uses an in-memory store for simplicity. In production, you'd want to use a database (PostgreSQL, MongoDB, etc.)
- Real-time updates use polling (every 2 seconds). For better performance, consider using WebSockets or Server-Sent Events
- Authentication is simplified for MVP. In production, add proper user authentication

## License

MIT
