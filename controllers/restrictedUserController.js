const RestrictedUser = require('../models/restrictedModel');

//
// ➕ Crear un nuevo perfil restringido
//
exports.addRestrictedUser = async (req, res) => {
  console.log("🔐 User from token:", req.user);
  const { name, pin, avatar } = req.body;

  // Validación de campos requeridos
  if (!name || !pin || !avatar) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  try {
    // Crear nueva instancia de RestrictedUser asociada al admin (parentUser)
    const newRestrictedUser = new RestrictedUser({
      name,
      pin,
      avatar,
      parentUser: req.user.id // ← ID del admin desde el token
    });

    // Guardar en la base de datos
    await newRestrictedUser.save();

    // Devolver el nuevo perfil creado
    res.status(201).json(newRestrictedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating a restricted user', error });
  }
};

//
// 📝 Editar un perfil restringido existente
//
exports.updateRestrictedUser = async (req, res) => {
  const { id } = req.params;
  const { name, pin, avatar } = req.body;

  // Validación de campos requeridos
  if (!name || !pin || !avatar) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  try {
    // Buscar y actualizar el perfil por su ID
    const updatedUser = await RestrictedUser.findByIdAndUpdate(
      id,
      { name, pin, avatar },
      { new: true } // Devolver el documento actualizado
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Restricted user not found." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating restricted user:", error);
    res.status(500).json({ message: 'Error updating restricted user', error });
  }
};

//
// 🗑 Eliminar un perfil restringido por ID
//
exports.deleteRestrictedUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar y eliminar por ID
    const deletedUser = await RestrictedUser.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Restricted user not found." });
    }

    // 204 = No Content (eliminación exitosa, sin datos que devolver)
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting restricted user', error });
  }
};
