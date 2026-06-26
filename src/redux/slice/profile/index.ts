import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Profile } from "@/types/user" // Adjust this path to your Profile type

type ProfileState = {user: Profile | null}
const initialState: ProfileState ={user: null}

const slice = createSlice({
  name: "profile", // This name defines the key in your state tree
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile | null>) => {
        state.user = action.payload
    },
    clearProfile(state) {
        state.user = null
    }
  },
})

export const { setProfile, clearProfile } = slice.actions
export default slice.reducer