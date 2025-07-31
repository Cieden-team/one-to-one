import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getActionItems = query({
  args: { user_email: v.string() },
  handler: async (ctx, args) => {
    const employees = await ctx.db.query("employees").collect()
    const currentUser = employees.find(emp => emp.email === args.user_email)
    
    if (!currentUser) return []
    
    const actionItems = await ctx.db.query("action_items").collect()
    
    // Отримуємо деталі для кожного action item
    const actionItemsWithDetails = await Promise.all(
      actionItems.map(async (item) => {
        const oneOnOne = await ctx.db.get(item.one_on_one_id)
        const employee = oneOnOne ? await ctx.db.get(oneOnOne.employee_id) : null
        const responsible = item.responsible_id ? await ctx.db.get(item.responsible_id) : null
        const createdBy = item.created_by ? await ctx.db.get(item.created_by) : null
        
        return {
          ...item,
          employee_name: employee?.name || "Unknown",
          responsible_name: responsible?.name || "Unassigned",
          created_by_name: createdBy?.name || "Unknown",
          meeting_date: oneOnOne?.date || "",
        }
      })
    )
    
    // Фільтруємо залежно від ролі користувача
    let filteredItems = actionItemsWithDetails
    
    if (currentUser.user_type === "lead") {
      // Lead бачить action items, які він створив або які призначені на нього
      filteredItems = actionItemsWithDetails.filter(item => 
        item.created_by === currentUser._id || item.responsible_id === currentUser._id
      )
    } else if (currentUser.user_type === "employee") {
      // Employee бачить тільки свої action items
      filteredItems = actionItemsWithDetails.filter(item => 
        item.responsible_id === currentUser._id
      )
    }
    // HR бачить всі
    
    // Фільтруємо archived items
    filteredItems = filteredItems.filter(item => item.progress !== "archived")
    
    // Сортуємо від новіших до старіших
    return filteredItems.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
  },
})

export const createActionItem = mutation({
  args: {
    one_on_one_id: v.id("one_on_ones"),
    text: v.string(),
    due_date: v.string(),
    responsible_id: v.optional(v.id("employees")),
    created_by: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()
    
    // Визначаємо початковий progress
    const dueDate = new Date(args.due_date)
    const today = new Date()
    let progress: "done" | "in_progress" | "overdue" | "archived" = "in_progress"
    
    if (dueDate < today) {
      progress = "overdue"
    }
    
    await ctx.db.insert("action_items", {
      one_on_one_id: args.one_on_one_id,
      text: args.text,
      done: false,
      due_date: args.due_date,
      responsible_id: args.responsible_id,
      progress,
      created_by: args.created_by,
      created_at: now,
    })
  },
})

export const updateActionItem = mutation({
  args: {
    id: v.id("action_items"),
    text: v.optional(v.string()),
    done: v.optional(v.boolean()),
    due_date: v.optional(v.string()),
    responsible_id: v.optional(v.union(v.id("employees"), v.null())),
    progress: v.optional(v.union(v.literal("done"), v.literal("in_progress"), v.literal("overdue"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const updates: any = {}
    
    if (args.text !== undefined) updates.text = args.text
    if (args.done !== undefined) updates.done = args.done
    if (args.due_date !== undefined) updates.due_date = args.due_date
    if (args.responsible_id !== undefined) updates.responsible_id = args.responsible_id
    if (args.progress !== undefined) updates.progress = args.progress
    
    // Автоматично оновлюємо progress на основі done статусу
    if (args.done === true) {
      updates.progress = "done"
    } else if (args.done === false && args.progress === "done") {
      // Якщо done = false, але progress був "done", перевіряємо due_date
      const dueDate = new Date(args.due_date || "")
      const today = new Date()
      updates.progress = dueDate < today ? "overdue" : "in_progress"
    }
    
    await ctx.db.patch(args.id, updates)
  },
})

export const deleteActionItem = mutation({
  args: { id: v.id("action_items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

 