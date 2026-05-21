describe('Navigation Flow', () => {
  beforeEach(() => {
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@cypress.com`;
    const testPassword = 'TestPass123!';

    cy.visit('/');
    cy.get('[data-testid="signup-link"]').click();
    cy.get('[data-testid="signup-screen"]').should('be.visible');
    cy.get('[data-testid="display-name-input"]').type('Test User');
    cy.get('[data-testid="email-input"]').type(testEmail);
    cy.get('[data-testid="password-input"]').type(testPassword);
    cy.get('[data-testid="signup-button"]').click();
    cy.get('[data-testid="home-screen"]').should('be.visible');
  });

  it('should display home screen with navigation options', () => {
    cy.get('[data-testid="home-screen"]').should('be.visible');
    cy.get('[data-testid="start-button"]').should('exist');
  });

  it('should navigate to component selector from home', () => {
    cy.get('[data-testid="start-button"]').click();
    cy.get('[data-testid="component-screen"]').should('be.visible');
  });

  it('should navigate to level selector when component is selected', () => {
    cy.get('[data-testid="start-button"]').click();
    cy.get('[data-testid="component-fonologico"]').click();
    cy.get('[data-testid="level-screen"]').should('be.visible');
  });

  it('should navigate to activity when level is selected', () => {
    cy.get('[data-testid="start-button"]').click();
    cy.get('[data-testid="component-fonologico"]').click();
    cy.get('[data-testid="level-level-1"]').click();
    cy.get('[data-testid="activity-screen"]').should('be.visible');
  });

  it('should navigate back from activity to level', () => {
    cy.get('[data-testid="start-button"]').click();
    cy.get('[data-testid="component-fonologico"]').click();
    cy.get('[data-testid="level-level-1"]').click();
    cy.get('[data-testid="exit-button"]').click();
    cy.get('[data-testid="level-screen"]').should('be.visible');
  });

  it('should navigate back from level to component', () => {
    cy.get('[data-testid="start-button"]').click();
    cy.get('[data-testid="component-fonologico"]').click();
    cy.get('[data-testid="back-button"]').click();
    cy.get('[data-testid="component-screen"]').should('be.visible');
  });
});
