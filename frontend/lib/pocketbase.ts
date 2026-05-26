import PocketBase from 'pocketbase'

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!)

// Disable auto-cancellation to prevent AbortError issues
// This stops the SDK from cancelling duplicate pending requests
pb.autoCancellation(false)

export default pb