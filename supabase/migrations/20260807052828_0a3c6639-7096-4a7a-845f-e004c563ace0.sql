REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

CREATE POLICY "palm_images_select_own" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'palm-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "palm_images_insert_own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'palm-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "palm_images_delete_own" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'palm-images' AND auth.uid()::text = (storage.foldername(name))[1]);