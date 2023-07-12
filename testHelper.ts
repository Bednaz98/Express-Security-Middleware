import process from 'child_process'
import { getTestServer } from '.'





const handle = getTestServer()

handle.startServer()
let func = () => { }
setTimeout(() => {
    const result = process.exec('jest', console.log)
    setTimeout(() => { result.kill(result.pid), handle.closServer() }, 5000)
}, 500)


