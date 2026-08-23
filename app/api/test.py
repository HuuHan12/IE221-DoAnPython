from auth.dependencies import supabase


print("Testing Supabase...")


response = (
    supabase
    .table("users")
    .select("id,email")
    .limit(5)
    .execute()
)


print("Users:")
print(response.data)