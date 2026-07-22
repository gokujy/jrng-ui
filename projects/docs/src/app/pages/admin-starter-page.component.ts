import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-starter-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="docs-container">
    <header class="j-page-hero j-page-hero--docs">
      <span class="j-page-eyebrow">Reference application</span>
      <h1>JRNG Angular Admin Starter</h1>
      <p>
        A professional standalone Angular application using JRNG UI for responsive navigation,
        dashboards, data, forms, authentication, themes and application states.
      </p>
    </header>
    <section class="docs-section">
      <h2>Included workflows</h2>
      <ul>
        <li>Responsive shell with collapsible desktop and mobile navigation</li>
        <li>Dashboard metrics, real charts, recent activity and user data table</li>
        <li>Typed user create and edit Reactive Forms</li>
        <li>Mock login, forgot password, route guard and API services</li>
        <li>Profile, settings, notifications, confirmations and toasts</li>
        <li>Loader, skeleton, empty and error states</li>
        <li>Light and dark themes with accessible controls</li>
      </ul>
    </section>
    <section class="docs-section">
      <h2>Use the standalone template</h2>
      <pre class="docs-code"><code>cd admin-starter
npm install
npm start</code></pre>
      <p>
        The Admin Starter is maintained as a separate project under the JRNG templates collection.
        Install JRNG UI from npm, then customize the mock services and routes for your application.
      </p>
    </section>
  </div>`,
})
export class AdminStarterPageComponent {}
