describe('Gestão de usuários', ()=> {

    beforeEach(() => {
        cy.exec('npm --prefix ../user-api run clear:db')
    })

    describe('Listar contendo 1 usuário', ()=> {

        // Executa somente este teste
        // it.only('Deve listar um usuário', () => {});

        it('Deve listar um usuário', () => {
            cy.request('POST', 'http://localhost:4000/users', {
                name: 'John Doe',
                email: 'john@doe.com'
            }).should(response => {

                expect(response.status).to.eq(201)

                cy.visit('/users')

                // Verificando se existe apenas uma tr
                cy.get('.MuiTable-root tbody tr').should('have.length', 1)

                console.log("XXXXXXXXXXXX RESPONSE ", response)

                // Verificando se a primeira coluna possui o id retornado
                let id_retornado = response.body.id
                cy.get('.column-id > .MuiTypography-root').contains(id_retornado)

                // Verificando se a segunda coluna possui o nome enviado no POST
                cy.get('.column-name > .MuiTypography-root').contains('John Doe')

                // Verificando se a terceira coluna possui o email enviado no POST
                cy.get('.column-email > .MuiTypography-root').contains('john@doe.com')
            })
        });

        it('Deve listar vazio', () => {

            it("sem usuários", () => {
                cy.visit('/users')
                cy.contains('No User yet').should('exist')
                cy.contains('Do you want to add one?').should('exist')
                cy.contains('Create').should('exist')
            })

        });

    });

    it('Deve cadastrar um novo usuário', ()=> {

        // Abrir o formulário
        cy.visit('http://localhost:3000/#/users')

        // Selecionar e clicar no botão de criar
        cy.get('a[aria-label=Create]').click()

        // Preencher o formulario e clicar em salvar
        cy.get('input[aria-describedby=name-helper-text]').type('Pietra eu te amo')
        cy.get('#email').type('ollyver@cypress.com.br')
        cy.get('button[aria-label=Save]').click()

        // Confirmar se o usuário foi criado
        cy.get('a[href="#/users"]').click()
        cy.get('.MuiTable-root tbody tr').should('have.length', 1)
    });

    it('Deve alterar um usuário cadastrado', ()=> {
        // O should é executado após a chamada http
        cy.request('POST', 'http://localhost:4000/users', {
            name: 'John Doe',
            email: 'john@doe.com'
        }).should(response => {
            expect(response.status).to.eq(201)
            cy.visit(`#/users/${response.body.id}`)

            // verifica estado inicial do formulário
            cy.get('#name').should('have.value', 'John Doe')
            cy.get('#email').should('have.value', 'john@doe.com')

            // altera os dados do usuário
            cy.get('#name').clear().type('Bob Doe')
            cy.get('#email').clear().type('bob@doe.com')

            // envia os dados
            cy.get('button[type=submit]').click()

            // confirmação visual da atualização
            cy.visit(`#/users/${response.body.id}`)
            cy.get('#name').should('have.value', 'Bob Doe')
            cy.get('#email').should('have.value', 'bob@doe.com')
        })
    });

    describe("Remoção", () => {

        beforeEach(() => {
            cy.request('POST', 'http://localhost:4000/users', {
                name: 'John Doe',
                email: 'john@doe.com'
            })
                .its('body')
                .as('user')
        })

        it("a partir da listagem", () => {
            cy.visit('/users')
            cy.get('.MuiTable-root tbody tr td input[type=checkbox]').click()
            cy.get('button[aria-label=Delete]').click()
            cy.wait(500)
            cy.contains('No User yet').should('exist')
            cy.contains('Do you want to add one?').should('exist')
            cy.contains('Create').should('exist')
        })

        it("a partir do formulário de edição", function () {
            const {id} = this.user;
            cy.visit(`#/users/${id}`)
            cy.get('button[aria-label=Delete]').click()
            cy.wait(500)
            cy.contains('No User yet').should('exist')
            cy.contains('Do you want to add one?').should('exist')
            cy.contains('Create').should('exist')
        })
    })

});