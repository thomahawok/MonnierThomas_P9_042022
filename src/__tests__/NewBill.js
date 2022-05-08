/**
 * @jest-environment jsdom
 */

import mockStore from "../__mocks__/store"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js";
import {localStorageMock} from "../__mocks__/localStorage.js"

import router from "../app/Router";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import userEvent from "@testing-library/user-event"
import {fireEvent, screen, waitFor} from "@testing-library/dom"


//jest.mock("../app/store", () => mockStore)

window.alert = jest.fn()

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
 
      window.onNavigate(ROUTES_PATH.NewBill)
      const mailIcon = screen.getByTestId('icon-mail')
      //Vérifie si icon-window existe
      expect(mailIcon).toBeTruthy();
      //vérifie si il y a bein la class active-icon'
      expect(mailIcon.classList).toContain('active-icon')
    })
  })

  describe("When I add an non-image file to up load", () => {
    test("Then an alert message is displayed", () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))

      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage})
      document.body.innerHTMLl = NewBillUI()

      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const fileInput = screen.getByTestId("file")

       fileInput.addEventListener("change", handleChangeFile)
       fireEvent.change(fileInput, {
         target: {
           files: [new File(["doc.pdf"], "doc.pdf", { type: "doc/pdf" })],
         },
       })
       
      expect(handleChangeFile).toHaveBeenCalled()
      expect(window.alert).toHaveBeenCalled()
    })
  })


  describe("When I add an image file to up load", () => {
    test("Then I should add the file", () => {
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))

      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage})
      document.body.innerHTMLl = NewBillUI()

      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const fileInput = screen.getByTestId("file")

       fileInput.addEventListener("change", handleChangeFile)
       fireEvent.change(fileInput, {
         target: {
           files: [new File(["doc.jpg"], "doc.jpg", { type: "doc/jpg" })],
         },
       })

      expect(handleChangeFile).toHaveBeenCalled()
      expect(fileInput.files[0].name).toBe("doc.jpg")
      console.log(fileInput)
      console.log(fileInput.files[0])
      console.log(fileInput.files[0].name)
    })
  })
})

/* test d'intégration POST
*/
describe("Given I am connected as an employee", () => {
  describe("When I am on newBills page", () => {
    test("fetches newbills from mock API POST", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))

      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage})
      document.body.innerHTMLl = NewBillUI()
      
      const inputData = {
        type: 'Transports',
        name: 'essai',
        amount: '100',
        date: '2021-03-29',
        vat: '20',
        pct: '20',
        commentary: 'no',
        fileURL: 'thisURL',
        fileName: 'thisName',
      }

      const type = screen.getByTestId('expense-type')
      userEvent.selectOptions(type, screen.getAllByText('Transports'))
      expect(type.value).toBe(inputData.type)

      const name = screen.getByTestId('expense-name')
      fireEvent.change(name, {target: {value: inputData.name}})
      expect(name.value).toBe(inputData.name)

      const date = screen.getByTestId('datepicker')
      fireEvent.change(date, { target: {value: inputData.date} })
      expect(date.value).toBe(inputData.date)

      const vat = screen.getByTestId('vat')
      fireEvent.change(vat, { target: {value: inputData.vat} })
      expect(vat.value).toBe(inputData.vat)

      const pct = screen.getByTestId('pct')
      fireEvent.change(pct, { target: {value: inputData.pct} })
      expect(pct.value).toBe(inputData.pct)

      const comment = screen.getByTestId('commentary')
      fireEvent.change(comment, { target: { value: inputData.commentary } })
      expect(comment.value).toBe(inputData.commentary)

      const submitNewBill = screen.getByTestId('form-new-bill')
      
      const handleSubmit = jest.fn(newBill.handleSubmit)
      submitNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(submitNewBill)
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        document.body.innerHTML = ''
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      it("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        document.body.innerHTML = BillsUI({ error: 'Erreur 404'})
        const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      it("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })
        document.body.innerHTML = BillsUI({ error: 'Erreur 500'})
        const message = screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })  
  })
})