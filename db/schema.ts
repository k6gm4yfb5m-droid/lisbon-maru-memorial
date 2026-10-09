import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";
export const tributes = sqliteTable("tributes", {
 id: text("id").primaryKey(),
 personId: text("person_id").notNull(),
 visitorId: text("visitor_id").notNull(),
 createdAt: text("created_at").notNull(),
}, table => [uniqueIndex("tribute_person_visitor").on(table.personId, table.visitorId), index("tribute_person").on(table.personId)]);
export const reflections = sqliteTable("visitor_reflections", {
 id: text("id").primaryKey(),
 visitorId: text("visitor_id").notNull(),
 name: text("name").notNull(),
 message: text("message").notNull(),
 locale: text("locale").notNull(),
 createdAt: integer("created_at").notNull(),
}, table => [index("reflection_date").on(table.createdAt,table.id), index("reflection_visitor_date").on(table.visitorId,table.createdAt)]);
export const reflectionAttachments = sqliteTable("reflection_attachments", {
 id: text("id").primaryKey(),
 reflectionId: text("reflection_id").notNull().references(()=>reflections.id,{onDelete:"cascade"}),
 filename: text("filename").notNull(),
 contentType: text("content_type").notNull(),
 byteSize: integer("byte_size").notNull(),
 objectKey: text("object_key").notNull(),
}, table => [index("reflection_attachment_parent").on(table.reflectionId)]);
