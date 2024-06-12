export const getAllSketches = async (req, res) => {
  res.send({ msg: "You will get all sketches here" });
};

export const uploadSketch = async (req, res) => {
    
  res.status(200).send(req.body.msg);
  /* res.send({ msg: "Sketches will be uploaded here" }); */
};
