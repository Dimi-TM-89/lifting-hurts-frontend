/*
 * Empty placeholder shown after Auth0 redirects back to /callback with the auth code.
 *
 * The Auth0 SDK's HTTP interceptor + handleRedirectCallback (registered via provideAuth0
 * in app.config.ts) does all the work — it parses the URL, exchanges the code for tokens,
 * and then triggers a navigation back to the original URL stored in `appState.target`.
 *
 * So this component has no logic on purpose: it's just a friendly "Logging in..." screen
 * for the few hundred milliseconds the SDK takes to finish.
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-callback-component',
  imports: [],
  templateUrl: './callback-component.html',
  styleUrl: './callback-component.css',
})
export class CallbackComponent {

}
