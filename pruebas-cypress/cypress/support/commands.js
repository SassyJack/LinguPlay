Cypress.Commands.add('loginAs', (email, password) => {
  cy.visit('/');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
});

Cypress.Commands.add('navigateToComponent', (componentId) => {
  cy.get(`[data-testid="component-${componentId}"]`).click();
});

Cypress.Commands.add('navigateToLevel', (levelId) => {
  cy.get(`[data-testid="level-${levelId}"]`).click();
});

Cypress.Commands.add('selectAnswer', (answerText) => {
  cy.contains(answerText).click();
});

Cypress.Commands.add('submitAnswer', () => {
  cy.get('[data-testid="submit-button"]').click();
});

Cypress.Commands.add('continueToNext', () => {
  cy.get('[data-testid="continue-button"]').click();
});

Cypress.Commands.add('waitForCelebration', () => {
  cy.get('[data-testid="celebration-overlay"]').should('be.visible');
  cy.wait(3000);
});

Cypress.Commands.add('exitActivity', () => {
  cy.get('[data-testid="exit-button"]').click();
});
