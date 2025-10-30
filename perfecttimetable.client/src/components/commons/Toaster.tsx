import { cssTransition, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './Toaster.css'

const fadeTransition = cssTransition({
    enter: 'toast-fade-enter',
    exit: 'toast-fade-exit',
    collapse: false,
})

export function Toaster() {
    return (
        <ToastContainer
            className="toaster"
            transition={fadeTransition}
            position="top-right"
            autoClose={4000}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
        />
    )
}

export default Toaster
