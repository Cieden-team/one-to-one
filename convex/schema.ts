import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  employees: defineTable({
    name: v.string(),
    role: v.string(),
    manager_id: v.optional(v.id("employees")),
    email: v.string(),
    user_type: v.union(v.literal("employee"), v.literal("lead"), v.literal("hr")),
  }).index("by_manager", ["manager_id"]),

  one_on_ones: defineTable({
    employee_id: v.id("employees"),
    date: v.string(),
    person_id: v.id("employees"), // Who conducted the 1:1
    topics: v.string(),
    status: v.union(v.literal("Green"), v.literal("Yellow"), v.literal("Red")),
    workload: v.union(v.literal("Low"), v.literal("Balanced"), v.literal("Overloaded")),
  })
    .index("by_employee", ["employee_id"])
    .index("by_person", ["person_id"])
    .index("by_date", ["date"]),

  action_items: defineTable({
    one_on_one_id: v.id("one_on_ones"),
    text: v.string(),
    done: v.boolean(),
    due_date: v.string(),
  }).index("by_one_on_one", ["one_on_one_id"]),
})
