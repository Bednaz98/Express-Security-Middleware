import axios from 'axios'
import { getTestServer } from '..'


describe('Testing server', () => {


    afterAll(() => {
        const handle = getTestServer()
        handle.closServer()
    })
    it('', async () => {
        await axios.get('http://localhost:3000/test')
        expect(true).toBe(true)
    })
})

