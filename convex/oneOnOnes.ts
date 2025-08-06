import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getByEmployee = query({
  args: {
    employee_id: v.id("employees"),
    user_email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const employees = await ctx.db.query("employees").collect()
    const currentUser = args.user_email ? 
      employees.find(emp => emp.email === args.user_email) : null
    const employee = await ctx.db.get(args.employee_id)

    // Check access permissions
    if (currentUser?.user_type !== "hr" && currentUser?.user_type !== "lead" && employee?.manager_id !== currentUser?._id) {
      return []
    }

    const meetings = await ctx.db
      .query("one_on_ones")
      .withIndex("by_employee", (q) => q.eq("employee_id", args.employee_id))
      .order("desc")
      .collect()

    const meetingsWithDetails = await Promise.all(
      meetings.map(async (meeting) => {
        const person = await ctx.db.get(meeting.person_id)
        const actionItems = await ctx.db
          .query("action_items")
          .withIndex("by_one_on_one", (q) => q.eq("one_on_one_id", meeting._id))
          .collect()

        return {
          ...meeting,
          person_name: person?.name || "Unknown",
          action_items: actionItems,
        }
      }),
    )

    return meetingsWithDetails
  },
})

export const create = mutation({
  args: {
    employee_id: v.id("employees"),
    date: v.string(),
    person_id: v.id("employees"),
    topics: v.string(),
    status: v.union(v.literal("Green"), v.literal("Yellow"), v.literal("Red")),
    workload: v.union(v.literal("Low"), v.literal("Balanced"), v.literal("Overloaded")),
    action_items: v.array(
      v.object({
        text: v.string(),
        due_date: v.string(),
        done: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { action_items, ...meetingData } = args

    const meetingId = await ctx.db.insert("one_on_ones", meetingData)

    // Insert action items
    for (const item of action_items) {
      await ctx.db.insert("action_items", {
        one_on_one_id: meetingId,
        ...item,
      })
    }

    return meetingId
  },
})

export const updateActionItem = mutation({
  args: {
    id: v.id("action_items"),
    done: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { done: args.done })
  },
})

export const updateOneOnOne = mutation({
  args: {
    id: v.id("one_on_ones"),
    date: v.string(),
    person_id: v.id("employees"),
    topics: v.string(),
    status: v.union(v.literal("Green"), v.literal("Yellow"), v.literal("Red")),
    workload: v.union(v.literal("Low"), v.literal("Balanced"), v.literal("Overloaded")),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args
    await ctx.db.patch(id, updateData)
  },
})

export const deleteOneOnOne = mutation({
  args: {
    id: v.id("one_on_ones"),
  },
  handler: async (ctx, args) => {
    // Спочатку видаляємо всі action items для цього мітингу
    const actionItems = await ctx.db
      .query("action_items")
      .withIndex("by_one_on_one", (q) => q.eq("one_on_one_id", args.id))
      .collect()
    
    for (const item of actionItems) {
      await ctx.db.delete(item._id)
    }
    
    // Потім видаляємо сам мітинг
    await ctx.db.delete(args.id)
  },
})
