import PocketBase from 'pocketbase'
const pb = new PocketBase('http://192.168.100.3:8090')
pb.autoCancellation(false)
export default pb
