import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { Id } from "./_generated/dataModel"

const employeesData = [
  { employee_id: "ci003", fullName: "Anastasiya Mudryk", department: "Product/ BA", position: "Product Manager/Business Analyst", email: "am@cieden.com", leader_id: "ci001" },
  { employee_id: "ci004", fullName: "Andrii Prokopsyshyn", department: "Design", position: "UX/UI Designer", email: "andrii.prokopyshyn@cieden.com", leader_id: "ci003" },
  { employee_id: "ci005", fullName: "Denis Dudar", department: "Design", position: "UX/UI Designer", email: "denis.dudar@cieden.com", leader_id: "ci018" },
  { employee_id: "ci006", fullName: "Iryna Mykytenko", department: "Design", position: "UX/UI Designer", email: "iryna.mykytenko@cieden.com", leader_id: "ci010" },
  { employee_id: "ci002", fullName: "Iryna Serednia", department: "other", position: "co-founder", email: "is@cieden.com", leader_id: null },
  { employee_id: "ci007", fullName: "Maksym Gozhelsky", department: "Design", position: "UX/UI Designer", email: "maksym.gozhelsky@cieden.com", leader_id: "ci036" },
  { employee_id: "ci008", fullName: "Daria Novosiadla", department: "Design", position: "UX/UI Designer", email: "daria.novosiadla@cieden.com", leader_id: "ci010" },
  { employee_id: "ci009", fullName: "Olesia Havryshko", department: "Product/ BA", position: "Product Manager/Business Analyst", email: "olesia.havryshko@cieden.com", leader_id: "ci003" },
  { employee_id: "ci010", fullName: "Roman Kaminechny", department: "Design", position: "UX/UI Designer", email: "roman.kaminechny@cieden.com", leader_id: "ci001" },
  { employee_id: "ci011", fullName: "Tetiana Zakus", department: "Design", position: "UX/UI Designer", email: "tetiana.zakus@cieden.com", leader_id: "ci010" },
  { employee_id: "ci001", fullName: "Yuriy Mykhasyak", department: "CEO", position: "CEO", email: "yuriy.mykhasyak@cieden.com", leader_id: null },
  { employee_id: "ci012", fullName: "Iryna Mykhasiak", department: "Talent Management", position: "Recruiter", email: "iryna.mykhasiak@cieden.com", leader_id: "ci031" },
  { employee_id: "ci013", fullName: "Nataliia Antonyshyn", department: "Finance", position: "Accountant", email: "nataliia.antonyshyn@cieden.com", leader_id: "ci040" },
  { employee_id: "ci014", fullName: "Demian Peretiatko", department: "Design", position: "UX/UI Designer", email: "demian.peretiatko@cieden.com", leader_id: "ci010" },
  { employee_id: "ci015", fullName: "Yuliia Braslavska", department: "Design", position: "UX/UI Designer", email: "yuliia.braslavska@cieden.com", leader_id: "ci009" },
  { employee_id: "ci016", fullName: "Marta Kacharaba", department: "Design", position: "UX/UI Designer", email: "marta.kacharaba@cieden.com", leader_id: "ci003" },
  { employee_id: "ci017", fullName: "Iryna Tanavska", department: "Design", position: "UX/UI Designer", email: "iryna.tanavska@cieden.com", leader_id: "ci018" },
  { employee_id: "ci018", fullName: "Tetiana Bondarchuk", department: "Product/ BA", position: "Product Manager/Business Analyst", email: "tetiana.bondarchuk@cieden.com", leader_id: "ci003" },
  { employee_id: "ci019", fullName: "Olha Kubrak", department: "Talent Management", position: "Office manager/Event manager", email: "olha.kubrak@cieden.com", leader_id: "ci031" },
  { employee_id: "ci020", fullName: "Khrystyna Nych", department: "Design", position: "UX/UI Designer", email: "khrystyna.nych@cieden.com", leader_id: "ci010" },
  { employee_id: "ci021", fullName: "Illia Suprun", department: "Design", position: "UX/UI Designer", email: "illia.suprun@cieden.com", leader_id: "ci010" },
  { employee_id: "ci022", fullName: "Maksym Vertsanov", department: "Design", position: "UX/UI Designer", email: "maksym.vertsanov@cieden.com", leader_id: "ci018" },
  { employee_id: "ci023", fullName: "Volodymyr Merlenko", department: "Design", position: "UX/UI Designer", email: "volodymyr.merlenko@cieden.com", leader_id: "ci003" },
  { employee_id: "ci024", fullName: "Bohdana Levochko", department: "Sales", position: "Lead Generation Manager", email: "bohdana.levochko@cieden.com", leader_id: "ci035" },
  { employee_id: "ci025", fullName: "Kristina Shkriabina", department: "Marketing", position: "Lead Marketing Manager", email: "kristina.shkriabina@cieden.com", leader_id: "ci001" },
  { employee_id: "ci026", fullName: "Karyna Khmelyk", department: "Design", position: "UX/UI Designer", email: "karyna.khmelyk@cieden.com", leader_id: "ci010" },
  { employee_id: "ci027", fullName: "Diana Danyllv", department: "Design/Marketing", position: "Graphic Designer", email: "diana.danyllv@cieden.com", leader_id: "ci025" },
  { employee_id: "ci028", fullName: "Tetiana Korol", department: "Marketing", position: "SMM Manager", email: "tetiana.korol@cieden.com", leader_id: "ci025" },
  { employee_id: "ci029", fullName: "Vladyslav Pianov", department: "Design", position: "UX/UI Designer", email: "vladyslav.pianov@cieden.com", leader_id: "ci010" },
  { employee_id: "ci030", fullName: "Viktoriia Boichuk", department: "Sales", position: "Lead Generation Manager", email: "viktoriia.boichuk@cieden.com", leader_id: "ci035" },
  { employee_id: "ci031", fullName: "Katya Gorodova", department: "Talent Management", position: "Head of Talent Management", email: "kateryna.gorodova@cieden.com", leader_id: "ci001" },
  { employee_id: "ci032", fullName: "Tamara Zhostka", department: "Marketing", position: "Content Manager", email: "tamara.zhostka@cieden.com", leader_id: "ci025" },
  { employee_id: "ci033", fullName: "Valeriia Nasikan", department: "Design", position: "UX/UI Designer", email: "valeriia.nasikan@cieden.com", leader_id: "ci011" },
  { employee_id: "ci034", fullName: "Valentyn Skliarov", department: "Design", position: "UX/UI Designer", email: "valentyn.skliarov@cieden.com", leader_id: "ci012" },
  { employee_id: "ci035", fullName: "Kateryna Zavaertailo", department: "Sales", position: "Sales Manager", email: "kateryna.zavaertailo@cieden.com", leader_id: "ci001" },
  { employee_id: "ci036", fullName: "Yulia Mahera", department: "Product/ BA", position: "Product Manager/Business Analyst", email: "yulia.mahera@cieden.com", leader_id: "ci003" },
  { employee_id: "ci037", fullName: "Dmytro Chyzh", department: "Design", position: "UX/UI designer", email: "dmytro.chyzh@cieden.com", leader_id: "ci013" },
  { employee_id: "ci038", fullName: "Nazar Vasylyshyn", department: "Design", position: "UX/UI designer", email: "nazar.vasylyshyn@cieden.com", leader_id: "ci014" },
  { employee_id: "ci039", fullName: "Bohdan Borys", department: "Design", position: "UX/UI designer", email: "bohdan.borys@cieden.com", leader_id: "ci015" },
  { employee_id: "ci040", fullName: "Nataliia Levko", department: "Finance", position: "Finance director/Chief accountant", email: "nataliia.levko@cieden.com", leader_id: "ci001" },
  { employee_id: "ci041", fullName: "Mykola Chumak", department: "Design", position: "UX/UI designer", email: "mykola.chumak@cieden.com", leader_id: "ci016" },
  { employee_id: "ci042", fullName: "Stepan Fityo", department: "Design", position: "UX/UI designer", email: "stepan.fityo@cieden.com", leader_id: "ci017" },
  { employee_id: "ci043", fullName: "Olha Shvets", department: "Design", position: "UX/UI designer", email: "olha.shvets@cieden.com", leader_id: "ci018" },
]

export const seedData = mutation({
  handler: async (ctx) => {
    // Clear existing data
    const tables: ("employees" | "one_on_ones" | "action_items")[] = ["employees", "one_on_ones", "action_items"];
    for (const table of tables) {
      const documents = await ctx.db.query(table).collect();
      await Promise.all(documents.map((doc) => ctx.db.delete(doc._id)));
    }
    
    console.log("Cleared all existing data.");

    // Determine user types
    const leaderIds = new Set(employeesData.map(e => e.leader_id).filter(Boolean));
    
    const getUserType = (emp: typeof employeesData[0]) => {
      if (emp.email === "yuriy.mykhasyak@cieden.com") return "hr";
      if (emp.email === "kateryna.gorodova@cieden.com") return "hr";
      if (leaderIds.has(emp.employee_id)) return "lead";
      if (emp.position === "co-founder") return "lead";
      // Додатково перевіряємо позиції, які зазвичай є Lead
      if (emp.position.includes("Manager") || emp.position.includes("Director") || emp.position.includes("Head")) return "lead";
      // Спеціально для Product Manager/Business Analyst
      if (emp.position.includes("Product Manager")) return "lead";
      return "employee";
    };

    // Insert all employees first
    const oldIdToNewId = new Map<string, Id<"employees">>();
    for (const emp of employeesData) {
      const user_type = getUserType(emp);
      console.log(`Setting ${emp.fullName} (${emp.email}) as ${user_type}`);
      const newId = await ctx.db.insert("employees", {
        name: emp.fullName,
        role: emp.position,
        email: emp.email,
        user_type,
        archived: false,
      });
      oldIdToNewId.set(emp.employee_id, newId);
    }

    console.log(`Inserted ${employeesData.length} employees.`);

    // Update manager_id for each employee
    let updatedManagerCount = 0;
    for (const emp of employeesData) {
      if (emp.leader_id) {
        const newEmployeeId = oldIdToNewId.get(emp.employee_id);
        const newManagerId = oldIdToNewId.get(emp.leader_id);
        
        if (newEmployeeId && newManagerId) {
          await ctx.db.patch(newEmployeeId, { manager_id: newManagerId });
          updatedManagerCount++;
        }
      }
    }
    
    console.log(`Updated manager links for ${updatedManagerCount} employees.`);
    
    return "Seed data with real users created successfully";
  },
})
