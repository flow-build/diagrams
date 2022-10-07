module.exports = {
  "name": "Simple BP",
  "description": "Simple BP for tests",
  "blueprint_spec": {
    "requirements": ["core"],
    "prepare": [],
    "nodes": [
      {
        "id": "START-PROCESS",
        "type": "Start",
        "name": "Start node",
        "next": "BAG-ACTOR",
        "parameters": {
          "input_schema": {}
        },
        "lane_id": "anyone"
      },
      {
        "id": "BAG-ACTOR",
        "type": "SystemTask",
        "name": "Set to bag",
        "category": "setToBag",
        "next": "END-SUCCESS",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "actor_id": {
              "$ref": "actor_data.actor_id"
            }
          }
        }
      },
      {
        "id": "END-SUCCESS",
        "type": "Finish",
        "name": "Finish node",
        "next": null,
        "lane_id": "anyone"
      }
    ],
    "lanes": [
      {
        "id": "anyone",
        "name": "the_only_lane",
        "rule": ["fn", ["&", "args"], true]
      }
    ],
    "environment": {}
  }
}