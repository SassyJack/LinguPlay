describe('Timer and Stars', () => {
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

  it('Se debe ver el contador de tiempo en la cabecera de la actividad', () => {
    cy.get('[data-testid="timer-bar"]').should('be.visible');
    cy.get('[data-testid="timer-bar"]').should('contain', 'Tiempo');
  });

  it('Ver el tiempo transcurrido en la actividad', () => {
    cy.get('[data-testid="timer-bar"]').invoke('text').then((initialText) => {
      cy.wait(2000);
      cy.get('[data-testid="timer-bar"]').invoke('text').then((newText) => {
        expect(newText).not.to.eq(initialText);
      });
    });
  });

  it('Verificar la visualización de estrellas en la sobreposición de celebración después de una respuesta correcta', () => {
    cy.get('[data-testid="choice-option-Mano"]').click();
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="celebration-overlay"]').should('be.visible');
    cy.get('[data-testid="celebration-overlay"]').should('contain', 'Correcto');
  });

  it('Se deben ver las estrellas ganadas en la pantalla de felicitación', () => {     
    cy.get('[data-testid="choice-option-Mano"]').click();
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="celebration-overlay"]').should('be.visible');
    cy.get('[data-testid="reward-text"]').should('exist');
  });

  it('Ver el selector de nivel después de completar todas las actividades', () => {
    cy.get('[data-testid="choice-option-Mano"]').click();
    cy.get('[data-testid="submit-button"]').click();
    cy.wait(3500);
    cy.get('[data-testid="activity-screen"]').should('be.visible');
    cy.get('[data-testid="choice-option-No, diferente"]').click();
    cy.get('[data-testid="submit-button"]').click();
    cy.wait(3500);
    cy.get('[data-testid="level-screen"]').should('be.visible');
  });
});
