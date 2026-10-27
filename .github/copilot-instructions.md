# Copilot Instructions for 06-ionic-nfc-room

## Project Overview

This is an Ionic 8 + Angular 19 hybrid mobile application that reads NFC (Near Field Communication) tags using Cordova plugins. The app follows a tab-based architecture and uses Capacitor for native mobile integration. It's a learning project built from an Udemy course.

**Key Stack:**
- Ionic 8 (standalone components)
- Angular 19 with TypeScript 5.6
- Capacitor 7.1 for native features (NFC, fingerprint, status bar, keyboard)
- Karma + Jasmine for unit testing
- ESLint + TypeScript strict mode

## Build, Test, and Lint Commands

### Running the application
```bash
npm start
# or
ng serve
```
Starts the dev server at `http://localhost:4200` with live reload. Use this for local development.

### Building for production
```bash
ng build
# or with watch mode for development
npm run watch
```
Outputs the production build to the `www/` directory, which is used by Capacitor for native builds.

### Testing
```bash
ng test
# Run a single test run (CI mode)
ng test --watch=false --code-coverage
```
Uses Karma + Jasmine. Tests are defined in `*.spec.ts` files and run in Chrome. Coverage reports are generated in `coverage/app/`.

### Running specific test files
```bash
ng test --include='**/src/app/services/alert.service.spec.ts'
ng test --include='**/src/app/pages/tab1/*.spec.ts'
```

### Linting
```bash
ng lint
# ESLint with --fix to auto-correct issues
ng lint --fix
```
Uses ESLint with Angular, TypeScript, and JSDoc rules. Enforces kebab-case for component selectors and component/page suffixes.

### Native/Mobile Commands
```bash
# Generate platform-specific icons and splash screens
npm run generate-icons-android
npm run generate-icons-ios
npm run generate-icons-pwa

# Build and open Android Studio
ionic capacitor build android

# Live development on Android device (with hot reload)
ionic capacitor run android -l --external
```

## Architecture & Structure

### High-Level Architecture

The app follows an **Ionic tab-based structure** with lazy-loaded pages:

```
src/app/
├── pages/
│   ├── tabs/              # Tab router outlet, holds tab navigation
│   │   └── tabs.routes.ts # Routes for tab 1, 2, etc.
│   ├── tab1/              # NFC reader page
│   ├── tab2/              # (Additional tab)
│   └── tabs/              # Tab router
├── services/
│   └── alert.service.ts   # Shared UI alerts (info, confirm, input dialogs)
├── app.routes.ts          # Root app router (loads tabs routes)
└── app.component.ts       # Root component with IonApp outlet
```

### Data Flow

1. **NFC Reading (Tab 1):** 
   - Uses `@awesome-cordova-plugins/nfc` with dependency injection
   - Subscribes to `nfc.addNdefListener()` on `ionViewWillEnter()`
   - Unsubscribes on `ionViewWillLeave()` to prevent memory leaks
   - Parses JSON from NFC tag payload (removes first 3 control bytes)
   - Shows alerts via injected `AlertService`

2. **Alert Service:**
   - Wraps `IonAlertController` from Ionic
   - Provides three methods: `alertMessage()`, `alertConfirm()`, `alertInput()`
   - Injected as a provider in page components

### Component Structure

- **Standalone Components:** All pages and services use Angular standalone API (`imports: [...]`)
- **Providers:** Services like `NFC` are provided at the page level when needed
- **Lifecycle Hooks:** Pages use `ionViewWillEnter` and `ionViewWillLeave` for Ionic-specific lifecycle management
- **Dependency Injection:** Uses Angular's `inject()` function (not constructor injection)

## Key Conventions

### File Naming & Organization
- **Pages:** Located in `src/app/pages/<pagename>/` with `.page.ts`, `.page.html`, `.page.scss`, `.page.spec.ts`
- **Services:** Located in `src/app/services/` with `.service.ts` and `.service.spec.ts`
- **Components:** Selector prefix is `app-` (kebab-case, e.g., `app-tab1`)
- **Styles:** SCSS files with `.scss` extension (Ionic default)

### Dependency Injection
```typescript
// Preferred pattern: use inject() function
private nfc: NFC = inject(NFC);
private alertService: AlertService = inject(AlertService);

// Constructor injection is also supported but less common in standalone
```

### Subscription Management
- Always unsubscribe from Observables to prevent memory leaks
- Use the `ionViewWillLeave()` lifecycle hook for cleanup
- Store subscriptions in a property and call `.unsubscribe()`

```typescript
private subscription: Subscription = new Subscription();

ionViewWillEnter() {
  this.subscription = this.nfc.addNdefListener().subscribe({...});
}

ionViewWillLeave() {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}
```

### Cordova/Capacitor Plugin Integration
- Plugins from `@awesome-cordova-plugins/*` provide TypeScript typings
- Must be added to page `providers` array to use native bridge
- Common plugins: NFC, Fingerprint AIO, Status Bar, Keyboard
- Installed via npm: `npm install @awesome-cordova-plugins/<plugin>`

### Error Handling & User Feedback
- Use `AlertService` for all user-facing messages (errors, info, confirmations)
- Wrap plugin calls in try-catch blocks (NFC tag parsing)
- Handle Promise rejections with `.catch()` (NFC enabled check)

### Testing
- Every page and service has a `.spec.ts` file (generated with `ionic g`)
- Use Jasmine's `describe()`, `it()`, and `beforeEach()` patterns
- Mock Ionic components and services

### TypeScript Configuration
- **Strict mode enabled:** `strict: true`
- **No implicit returns:** `noImplicitReturns: true`
- **Property access from index:** `noPropertyAccessFromIndexSignature: true`
- Target: ES2022 with ES2020 modules
- Experiments: Decorators enabled for Angular

### ESLint Rules
- Component selectors: `element` type with `app` prefix in kebab-case
- Directive selectors: `attribute` type with `app` prefix in camelCase
- Suffixes: Components must end with `Component` or `Page`
- No prefer-arrow functions (but arrow functions are allowed)
- JSDoc documentation encouraged (jsdoc plugin enabled)

## Generating New Pages and Services

### Generate a new page
```bash
ionic g page pages/<pagename>
# Creates: src/app/pages/<pagename>/<pagename>.page.{ts,html,scss,spec.ts}
```
The generated page automatically:
- Uses standalone component syntax
- Imports necessary Ionic components
- Includes a spec file for testing

### Generate a new service
```bash
ionic g s services/<servicename>
# Creates: src/app/services/<servicename>.service.{ts,spec.ts}
```
The generated service is automatically provided at the root level.

### Generate a pipe
```bash
ionic g pipe pipes/<pipename>
```

## Common Patterns in This Project

### Reading NFC Tags
```typescript
this.nfc.enabled().then(() => {
  this.subscription = this.nfc.addNdefListener().subscribe({
    next: (event: NdefEvent) => {
      const records = event.tag.ndefMessage;
      if (records?.length > 0) {
        const text = this.nfc.bytesToString(records[0].payload).substring(3);
        const data = JSON.parse(text); // e.g., {hotel: string, room: string}
      }
    }
  });
}).catch(err => {
  // Handle NFC not enabled
});
```

### Using Alerts
```typescript
// Simple info alert
await this.alertService.alertMessage('Title', 'Message text');

// Confirmation dialog
await this.alertService.alertConfirm('Title', 'Message', () => {
  // Code executed if confirmed
});

// Input dialog
const result = await this.alertService.alertInput('Title', [
  { name: 'field1', type: 'text', placeholder: 'Enter text' }
]);
if (result?.data) {
  console.log(result.data);
}
```

## Capacitor & Native Development

- **Android builds:** See `ionic capacitor build android`
- **Icon/Splash generation:** Images placed in `resources/` folder, then use `npm run generate-icons-android`
- **Capacitor config:** `capacitor.config.ts` defines plugins, capabilities, and platform settings
- **Android Studio:** Automatically opens after `ionic capacitor build android`

## Documentation References

- [Ionic Framework Docs](https://ionicframework.com/docs)
- [Ionic CLI Docs](https://ionic-docs-lq0if04rc-ionic1.vercel.app/docs/v7/intro/cli)
- [Capacitor Docs](https://capacitorjs.com/)
- [Angular 19 Guide](https://angular.io/)
