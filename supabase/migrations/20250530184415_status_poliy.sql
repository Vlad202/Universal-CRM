-- Для обновления
create policy "Users can update statuses"
  on status_definitions
  for update
  using (true);

-- Для удаления
create policy "Users can delete statuses"
  on status_definitions
  for delete
  using (true);
