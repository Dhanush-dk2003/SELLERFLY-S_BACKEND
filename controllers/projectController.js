import prisma from '../prisma/client.js';

export const createProject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Project name required" });
    const existing = await prisma.project.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: 'Project with this name already exists' });
    }

    const project = await prisma.project.create({
      data: { name }
    });

    res.status(201).json({ message: 'Project created', project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
// ✅ Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        users: true,
        tasks: true
      }
    });
    res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ✅ Get single project by ID
export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: true,
        tasks: true
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ✅ Update project status
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
};


// ✅ Delete project
export const deleteProject = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // delete tasks first to avoid constraint violation
    await prisma.task.deleteMany({
      where: { projectId: id }
    });

    await prisma.project.delete({
      where: { id }
    });

    res.status(204).send(); // No content
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};
