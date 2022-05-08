/**
 * @jest-environment jsdom
 */
import mockStore from "../__mocks__/store"
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import router from "../app/Router.js"
import store from "../app/store"
import { formatDate, formatStatus } from "../app/format.js";
import "@testing-library/jest-dom"

//jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
    /**
     * Véridication la présence d'une classe sur un élemément HTML
     **/

     /** La méthode statique Object.defineProperty() permet de définir 
      * une nouvelle propriété ou de modifier une propriété existante,
      * directement sur un objet. La méthode renvoie l'objet modifié. 
      * 
      * Object.defineProperty(obj, prop, descripteur)
      * obj (windows): L'objet sur lequel on souhaite définir ou modifier une propriété.
      * prop (localStorage) : Le nom ou le symbole (Symbol) de la propriété qu'on définit ou qu'on modifie.
      * descripteur ({ value: localStorageMock }): Le descripteur de la propriété qu'on définit ou qu'on modifie.
      * */
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      /*   console.log(window.localStorage)
      *{
      *  getItem: [Function: getItem],
      *  setItem: [Function: setItem],
      *  clear: [Function: clear],
      *  removeItem: [Function: removeItem]
      *}
      */

      // cf _mocks_ / localStorage.js : useur = Employee
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))

      // création d'une div id="root"
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      // P.M. import router from "../app/Router.js"
      router()

      //Dans constants/routes : Bills: '#employee/bills
      //Dans App/Router : window.onNavigate = (pathname = ROUTES_PATH.Bills = #employee/bills) 
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByTestId('icon-window'))

      // Récuprére l'élément icon
      const windowIcon = screen.getByTestId('icon-window')

      //to-do write expect expression
      //Vérifie si icon-window existe
      expect(windowIcon).toBeTruthy();
      //vérifie s'il y a bein la class active-icon'
      expect(windowIcon.classList).toContain('active-icon')
      //ou
      expect(windowIcon).toHaveClass('active-icon')
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Tests unitaires
    /**
     * Loadin test
     */
    describe("When I am on the Bills page but it is loading", () => {
      test(("Then the loading page should be rendered"), () => {
        // configure le body du document
        document.body.innerHTML = BillsUI({ loading: true })

        // récupére le texte et vérifie qu'il est vraie (existe)
        const loadingMessage = screen.getAllByText('Loading...')
        expect(loadingMessage).toBeTruthy()
      })
    })

     /**
     * Erreur test
     */
    describe("When I am on the Bills page and back-end send an error message", () => {
      test(("Then the error page should be rendered"), () => {
        // configure le body du document
        document.body.innerHTML = BillsUI({ error: true})

        // récupére la div et vérifie qu'elle' est vraie (existe)
        const divError = screen.getByTestId('error-message')
        expect(divError).toBeTruthy()

        // récupére le texte et vérifie qu'il est vraie (existe)
        const erreurMessage = screen.getAllByText('Erreur')
        expect(erreurMessage).toBeTruthy()
      })
    })
    
     /**
     * No bill test
     */
    test('Then no bills should be shown if there are no bills', () => {
      // configure le body du document
      document.body.innerHTML = BillsUI({ data: [] })
      /* 
      * Les méthodes standards getBy génèrent une erreur lorsqu'elles ne trouvent pas d'élément,
      * donc si je veux affirmer qu'un élément n'est pas présent dans le DOM, 
      * j'utilise les API queryBy à la place.
      */
      const iconEye = screen.queryByTestId('icon-eye')
      expect(iconEye).toBeNull()
    })

    /**
    * Bills test
    */
    test('Then bills are shown if there are bills', () => {
      // configure le body du document
      document.body.innerHTML = BillsUI({ data: bills })

      // récupére les div et vérifie qu'elles sont vraies (existes) et qu'il y à au moins 1 élément 
      const iconEyes = screen.getAllByTestId('icon-eye')
      expect(iconEyes).toBeTruthy()
      expect(iconEyes.length).toBeGreaterThan(1)

      // récupére l'élément tbodyv et vérifie qu'qu'il nest pas vide 
      const tbody = screen.getByTestId("tbody")
      expect(tbody.innerHTML).not.toBe("")

    })
  
    // Tests d'intégrations
    /**
    * New Bill page test
    */
    describe("When I am on Bills page and I click on the New Bill button", () => {
      test(("Then, I get on the New Bill page"), () => {
        /**
       * On verifie que l'on navigue vers la page newBills
       **/
        // Init onNavigate
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        // UI Construction
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
        type: 'emplyee'
        }))

        const billsUIContainer = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })

        // configure le body du document
        document.body.innerHTML = BillsUI({ data: bills })

        // Simule (mock) la fonction handleClickNewBill de Bills.js, ligne : 23
        const handleClickNewBillButton = jest.fn(billsUIContainer.handleClickNewBill)

        // récupère le bouton new-bill
        const newBillButton = screen.getByTestId('btn-new-bill')

        // écoute le boutton et simule un click
        newBillButton.addEventListener('click', handleClickNewBillButton)
        userEvent.click(newBillButton)

        // vérifie que handleClickNewBill est appellée
        expect(handleClickNewBillButton).toHaveBeenCalled()

        // vérifie qu'il existe bien un texte spécifque à la page
        const newBillTitle = screen.getByText('Envoyer une note de frais')
        expect(newBillTitle).toBeTruthy()
      })
    })

    /**
    * Modal test
    */
    test(("Then I click on iconEye and a modal should be open"), () => {
       /**
       * On verifie que la modale s'ouvre lors du click sur l'icone "eye"
       **/

      // Init onNavigate
      const onNavigate = (pathname) => {
       document.body.innerHTML = ROUTES({ pathname })
      }
      
      // UI Construction
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      // Init store
      const store = null
      const billsUIContainer = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      // configure le body du document
      document.body.innerHTML = BillsUI({ data: bills })

      // Mock lafonction modal
      $.fn.modal = jest.fn();

      // Récupère le premier boutton eye
      const iconEye = screen.getAllByTestId("icon-eye")[0];

      //Mock la fonction handleClickIconEye den Bills.js , line : 23
      const handleClickIconEyeButton = jest.fn(billsUIContainer.handleClickIconEye(iconEye))
    
      // écoute le boutton et simule un click
      iconEye.addEventListener('click', handleClickIconEyeButton)
      userEvent.click(iconEye)

      const modale = document.getElementById("modaleFile");
      
      // vérifie que handleClickIconEye est appellée
      expect(handleClickIconEyeButton).toHaveBeenCalled()

      //On vérifie que la modale est visible dans la DOM
      expect(modale).toBeTruthy()

      //On vérifie que la fonction modale est appellée
      expect($.fn.modal).toHaveBeenCalled()
    })
  })
})


// test d'intégration GET (PM. requêtes HTTP onnées à envoyer au serveur sont écrites directement dans l’URL)
describe("Given I am connected as an employee", () => {
 describe("When I am on Bills page", () => {
   test("fetches Bills from mock API GET", async () => {
      // cf _mocks_ / localStorage.js : useur = Employee
     localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
     
     // création d'une div id="root"
     const root = document.createElement("div")
     root.setAttribute("id", "root")
     document.body.append(root)

     // P.M. import router from "../app/Router.js"
     //Active le routeur pour configurer la page
     router()
     window.onNavigate(ROUTES_PATH.Bills)

     await waitFor(() => screen.getByTestId("tbody"))

     expect(screen.getByTestId("tbody").innerHTML).not.toBe("")
   })

   test('if store, should display bills with right format date and status ', async () => {

    const billsUIContainer = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
    
     const data = await billsUIContainer.getBills()
    
     const mockedBills = await mockStore.bills().list()

     expect(data[0].date).toEqual(formatDate(mockedBills[0].date))
     console.log(data[0].date)
     console.log(mockedBills[0].date)

     expect(data[0].status).toEqual(formatStatus(mockedBills[0].status))
     console.log(data[0].status)
     console.log(mockedBills[0].status)
   })

   test('if store, if corrupted data was introduced, should log the error and return unformatted date in that case', async () => {
    const store = {
      bills() {
        return {
          list() {
            return Promise.resolve([{
              "id": "47qAXb6fIm2zOKkLzMro",
              "vat": "80",
              "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
              "status": "pending",
              "type": "Hôtel et logement",
              "commentary": "séminaire billed",
              "name": "encore",
              "fileName": "preview-facture-free-201801-pdf-1.jpg",
              "date": "2004-04-x",
              "amount": 400,
              "commentAdmin": "ok",
              "email": "a@a",
              "pct": 20
            }])
          },
        }
      }
    }

    const billsUIContainer = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
    })
    
    const consoleLog = jest.spyOn(console, 'log')
    const data = await billsUIContainer.getBills()

    expect(consoleLog).toHaveBeenCalled()
    expect(data[0].date).toEqual('2004-04-x')
    console.log(data[0].date)
    expect(data[0].status).toEqual('En attente')
   })


   
   describe("When an error occurs on API", () => {
   beforeEach(() => {
      /*
      * jest.spyOn :Crée une fonction simulée similaire à jest.fn mais qui surveille également
      * les appels à objet[methodName]. Retourne une fonction simulée de Jest.
      */
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

     test("fetches bills from an API and fails with 404 message error", async () => {
       /*
       *mockImplementationOnce : Accepte une fonction qui sera utilisée comme une implémentation de simulation pour
       * un appel à la fonction simulée. Peut être enchaîné de sorte que plusieurs appels de 
       * fonction produisent des résultats différents.
       */
       mockStore.bills.mockImplementationOnce(() => {
         return {
           list : () =>  {
             return Promise.reject(new Error("Erreur 404"))
           }
         }
       })
       window.onNavigate(ROUTES_PATH.Bills)
       document.body.innerHTML = BillsUI({ error: "Erreur 404" })
       const message = await screen.getByText(/Erreur 404/)
       expect(message).toBeTruthy()
     })
     test("fetches bills from an API and fails with 500 message error", async () => {
       mockStore.bills.mockImplementationOnce(() => {
         return {
           list : () =>  {
             return Promise.reject(new Error("Erreur 500"))
           }
         }
       })
       window.onNavigate(ROUTES_PATH.Bills)
       document.body.innerHTML = BillsUI({ error: "Erreur 500" })
       const message = await screen.getByText(/Erreur 500/)
       expect(message).toBeTruthy()
     })
   })
 })
})
