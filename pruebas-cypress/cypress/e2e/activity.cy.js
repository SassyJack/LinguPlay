describe('Activity Flow', () => {
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
    cy.get('[data-testid="start-button"]').click();
    cy.get('[data-testid="component-fonologico"]').click();
    cy.get('[data-testid="level-level-1"]').click();
    cy.get('[data-testid="activity-screen"]').should('be.visible');
  });

  it('Se debe ver la instrucción y el prompt en la pantalla de la actividad', () => {
    cy.get('[data-testid="instruction-card"]').should('be.visible');
    cy.get('[data-testid="prompt-card"]').should('be.visible');
    cy.get('[data-testid="instruction-text"]').should('exist');
    cy.get('[data-testid="prompt-text"]').should('exist');
  });

  it('Ver el contador de tiempo en la cabecera de la actividad', () => {  
    cy.get('[data-testid="activity-header"]').should('be.visible');
    cy.get('[data-testid="activity-title"]').should('exist');
    cy.get('[data-testid="exit-button"]').should('exist');
    cy.get('[data-testid="timer-bar"]').should('exist');
  });

  it('Se debe ver un mensaje de error cuando se envía sin seleccionar una respuesta', () => {
    cy.get('[data-testid="submit-button"]').should('have.attr', 'aria-disabled', 'true');
  });

  it('Se debe ver la tarjeta de resultado después de enviar la respuesta correcta', () => {
    cy.get('[data-testid="choice-option-Mano"]').click();
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="result-card"]').should('be.visible');
    cy.get('[data-testid="result-title"]').should('contain', 'Correcto');
  });

  it('Se debe ver la pantalla de felicitación después de enviar la respuesta correcta', () => {
    cy.get('[data-testid="choice-option-Mano"]').click();
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="celebration-overlay"]').should('be.visible');
  });

  it('Se debe deshabilitar el botón Continuar durante la felicitación', () => {
    cy.get('[data-testid="choice-option-Mano"]').click();
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="celebration-overlay"]').should('be.visible');
    cy.wait(1000);
    cy.get('[data-testid="continue-button"]').should('have.attr', 'aria-disabled', 'true');
  });

  it('Se debe ver la opción de intentar de nuevo después de enviar la respuesta incorrecta', () => {
    cy.get('[data-testid="choice-option-Sol"]').click();
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="result-card"]').should('be.visible');
    cy.get('[data-testid="result-title"]').should('contain', 'Intenta');
  });

  it('Se debe reiniciar la actividad después de intentar de nuevo', () => {
    cy.get('[data-testid="choice-option-Sol"]').click();
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="celebration-overlay"]').should('be.visible');
    cy.wait(3000);
    cy.get('[data-testid="submit-button"]').should('be.visible');
    cy.get('[data-testid="result-card"]').should('not.exist');
  });
});
