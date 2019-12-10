import { Button, Box, Text } from "grommet";
import { Trash } from "grommet-icons";
import { useMutation } from "@apollo/client";
import { withRouter } from "react-router-dom";
import React, { useState } from "react";

import { DELETE_POST, DELETE_REPLY } from "../../graphql/mutations";
import {
  GET_POST,
  GET_POSTS,
  GET_PROFILE_CONTENT
} from "../../graphql/queries";
import { useAuth } from "../../context/AuthContext";
import Modal from "../Modal";

const DeleteContentModal = ({
  history,
  iconSize,
  id,
  isReply,
  parentPostId
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    viewerQuery: {
      data: { viewer }
    }
  } = useAuth();

  const onCompleted = () => {
    setModalOpen(false);
    history.push("/home");
  };
  const [deletePost, { loading }] = useMutation(DELETE_POST, {
    onCompleted,
    refetchQueries: () => [
      {
        query: GET_POSTS,
        variables: {
          filter: {
            followedBy: viewer.profile.username,
            includeBlocked: false
          }
        }
      },
      {
        query: GET_PROFILE_CONTENT,
        variables: { username: viewer.profile.username }
      }
    ]
  });
  const [deleteReply] = useMutation(DELETE_REPLY, {
    onCompleted,
    refetchQueries: () => [
      ...(parentPostId
        ? [{ query: GET_POST, variables: { id: parentPostId } }]
        : []),
      {
        query: GET_PROFILE_CONTENT,
        variables: { username: viewer.profile.username }
      }
    ]
  });

  return (
    <Box direction="row" onClick={event => event.stopPropagation()}>
      <Modal
        handleClose={() => setModalOpen(false)}
        isOpen={modalOpen}
        title="Please Confirm"
        width="medium"
      >
        <Text as="p">
          {`Are you sure you want to permanently delete this ${
            isReply ? "reply" : "post"
          }?`}
        </Text>
        <Box direction="row" justify="end">
          <Button
            color="status-critical"
            disabled={loading}
            label="Delete"
            onClick={() => {
              if (isReply) {
                deleteReply({ variables: { where: { id } } });
              } else {
                deletePost({ variables: { where: { id } } });
              }
            }}
            primary
          />
        </Box>
      </Modal>
      <Button
        a11yTitle="Delete"
        icon={<Trash color="status-critical" size={iconSize} />}
        onClick={() => setModalOpen(true)}
      />
    </Box>
  );
};

DeleteContentModal.defaultProps = {
  iconSize: "small",
  isReply: false,
  parentPostId: null
};

export default withRouter(DeleteContentModal);