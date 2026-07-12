import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-community-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="docs-container">
    <header class="j-page-hero j-page-hero--docs">
      <span class="j-page-eyebrow">Community</span>
      <h1>Build and contribute with JRNG UI</h1>
      <p>
        Use public project channels for support, reusable proposals, security reports and
        contributions.
      </p>
    </header>
    <section class="j-community-links">
      <a href="https://github.com/gokujy/jrng-ui/issues" target="_blank" rel="noreferrer"
        >GitHub Issues</a
      ><a href="https://github.com/gokujy/jrng-ui/discussions" target="_blank" rel="noreferrer"
        >GitHub Discussions</a
      ><a
        href="https://github.com/gokujy/jrng-ui/issues/new?template=feature_request.yml"
        target="_blank"
        rel="noreferrer"
        >Feature requests</a
      ><a
        href="https://github.com/gokujy/jrng-ui/blob/main/CONTRIBUTING.md"
        target="_blank"
        rel="noreferrer"
        >Contribution guide</a
      ><a
        href="https://github.com/gokujy/jrng-ui/blob/main/SECURITY.md"
        target="_blank"
        rel="noreferrer"
        >Security policy</a
      ><a
        href="https://github.com/gokujy/jrng-ui/blob/main/ROADMAP.md"
        target="_blank"
        rel="noreferrer"
        >Roadmap</a
      ><a
        href="https://github.com/gokujy/jrng-ui/blob/main/SUPPORT.md"
        target="_blank"
        rel="noreferrer"
        >Support</a
      >
    </section>
    <section class="docs-section">
      <h2>Built with JRNG UI</h2>
      <p class="docs-lead">Only verified project-owned implementations are listed.</p>
      <div class="j-guide-index">
        <article>
          <h3>JRNG UI documentation</h3>
          <p>The documentation and component preview website in this repository.</p>
          <a routerLink="/">View documentation</a>
        </article>
        <article>
          <h3>JRNG Angular Admin Starter</h3>
          <p>The responsive, lazy-loaded reference admin application in this workspace.</p>
          <a routerLink="/admin-starter">View starter details</a>
        </article>
      </div>
    </section>
    <section class="docs-section">
      <h2>Submit a future project</h2>
      <p>Open a GitHub Discussion and include:</p>
      <ul>
        <li>Project name</li>
        <li>Public URL</li>
        <li>Repository URL</li>
        <li>Screenshot</li>
        <li>Short description</li>
        <li>JRNG UI version</li>
        <li>Explicit permission to display the project</li>
      </ul>
      <p class="docs-lead">
        Submissions must be publicly verifiable. A submission does not guarantee inclusion.
      </p>
    </section>
  </div>`,
})
export class CommunityPageComponent {}
