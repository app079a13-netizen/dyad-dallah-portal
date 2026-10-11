/*
# Add RLS policies for dallah_visitor_commands

The dallah_visitor_commands table had RLS enabled but zero policies,
which meant every SELECT, INSERT, UPDATE, and DELETE from the anon/authenticated
roles silently returned empty or was blocked. This broke the admin-to-visitor
redirect command pipeline: the admin's INSERT appeared to succeed on the client
but was blocked server-side, and the visitor's SELECT always returned zero rows.

1. Security changes
   - Add SELECT policy for anon + authenticated (visitor polls for pending commands)
   - Add INSERT policy for anon + authenticated (admin sends commands)
   - Add UPDATE policy for anon + authenticated (visitor marks commands consumed)
   - Add DELETE policy for anon + authenticated (admin cleanup)
*/

DROP POLICY IF EXISTS "anon_select_visitor_commands" ON dallah_visitor_commands;
CREATE POLICY "anon_select_visitor_commands"
  ON dallah_visitor_commands FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "anon_insert_visitor_commands" ON dallah_visitor_commands;
CREATE POLICY "anon_insert_visitor_commands"
  ON dallah_visitor_commands FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_visitor_commands" ON dallah_visitor_commands;
CREATE POLICY "anon_update_visitor_commands"
  ON dallah_visitor_commands FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_visitor_commands" ON dallah_visitor_commands;
CREATE POLICY "anon_delete_visitor_commands"
  ON dallah_visitor_commands FOR DELETE
  TO anon, authenticated
  USING (true);
