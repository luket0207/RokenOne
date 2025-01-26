import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditTeam.scss";
import Button from "../../Components/Button/Button";
import Modal from "../../Components/Modal/Modal";
import { GameDataContext } from "../../Data/GameDataContext/GameDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const EditTeam = () => {
  const navigate = useNavigate();
  const { playerTeam, playerData, setPlayerTeam } = useContext(GameDataContext);
  const maxTeammates = playerData[0]?.maxTeammates || 0;
  const unlockedTeammates = playerData[0]?.unlockedTeammates || [];

  // Handle the currently selected slot for adding a character
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle opening the modal for the specific slot
  const openModal = (slotIndex) => {
    setSelectedSlot(slotIndex);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const closeModal = () => {
    setSelectedSlot(null);
    setIsModalOpen(false);
  };

  // Handle selecting a character for the slot
  const selectTeammateForSlot = (teammate) => {
    const updatedTeam = [...playerTeam];
    updatedTeam[selectedSlot] = teammate;
    setPlayerTeam(updatedTeam);
    closeModal();
  };

  // Handle removing a character from a slot
  const removeCharacter = (index) => {
    // Check if the slot is empty (i.e., no character in the slot)
    if (!playerTeam[index]) {
      return; // Do nothing if the slot is empty
    }

    const updatedTeam = [...playerTeam];
    updatedTeam.splice(index, 1); // Remove the character from the array
    setPlayerTeam(updatedTeam);
  };

  const handleHome = () => {
    navigate("/home");
  };

  const navigateToEdit = (id) => {
    const navString = `/edit/t/${id}`;
    navigate(navString);
  };

  return (
    <div className="edit-team">
      <h1>Edit Team</h1>
      <p>Add or remove teammates from your team</p>
      <p>Max team size: {maxTeammates}</p>

      <h2>Current Team</h2>
      <div className="team-slots">
        {Array.from({ length: maxTeammates }).map((_, index) => (
          <div className="team-slot" key={index}>
            {playerTeam[index] ? (
              <div key={playerTeam[index].id} className="team-teammate">
                <h3>{playerTeam[index].name}</h3>
                <Button
                  text={"Edit"}
                  onClick={() => navigateToEdit(playerTeam[index].id)} // Wrap in arrow function
                  type={"secondary"}
                ></Button>
                {index !== 0 && ( // Roken cannot be removed
                  <div
                    onClick={() => removeCharacter(index)} // Wrap in arrow function
                    className="remove-character"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </div>
                )}
              </div>
            ) : (
              <Button
                text={"Add Teammate"}
                onClick={() => openModal(index)}
                type={"secondary"}
              ></Button>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="select-modal">
          <h2>Select a Teammate</h2>
          <div className="select-teammate">
            {unlockedTeammates
              .filter(
                (teammate) =>
                  !playerTeam.some((member) => member?.id === teammate.id) &&
                  teammate.id !== 1 // Exclude Roken
              )
              .map((teammate) => (
                <div key={teammate.id} className="select-teammate-character">
                 <h4>{teammate.name}</h4>
                  <Button
                    text={"Select"}
                    onClick={() => selectTeammateForSlot(teammate)}
                    type={"secondary"}
                  ></Button>
                </div>
              ))}
          </div>
        </div>
      </Modal>

      <Button text={"Home"} onClick={handleHome} />
    </div>
  );
};

export default EditTeam;
