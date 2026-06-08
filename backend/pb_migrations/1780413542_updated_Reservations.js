/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1340358087")

  // update collection data
  unmarshal({
    "name": "reservations"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1340358087")

  // update collection data
  unmarshal({
    "name": "Reservations"
  }, collection)

  return app.save(collection)
})
