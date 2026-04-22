import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Project } from '../../types';
import { projectsApi } from '../../api/projects';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params: { status?: string; search?: string }, { rejectWithValue }) => {
    try {
      const response = await projectsApi.getAll(params);
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const fetchProject = createAsyncThunk(
  'projects/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await projectsApi.getById(id);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (data: Partial<Project>, { rejectWithValue }) => {
    try {
      const response = await projectsApi.create(data);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, data }: { id: string; data: Partial<Project> }, { rejectWithValue }) => {
    try {
      const response = await projectsApi.update(id, data);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await projectsApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);

export const addTeamMemberToProject = createAsyncThunk(
  'projects/addTeamMember',
  async ({ id, email }: { id: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await projectsApi.addTeamMember(id, email);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add team member');
    }
  }
);

export const removeTeamMemberFromProject = createAsyncThunk(
  'projects/removeTeamMember',
  async ({ id, userId }: { id: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await projectsApi.removeTeamMember(id, userId);
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove team member');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.currentProject = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(addTeamMemberToProject.fulfilled, (state, action) => {
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(removeTeamMemberFromProject.fulfilled, (state, action) => {
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      });
  },
});

export const { clearError } = projectSlice.actions;
export default projectSlice.reducer;

