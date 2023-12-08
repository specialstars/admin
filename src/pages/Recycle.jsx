import React from "react";

/* Components */
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Modal from "./components/Modal";
import Alert from "./components/./Alert";
import Edit from "./components/./Edit";
import Navbar from "./components/Navbar";
import Guest from "./components/Guest";

/* Icons */
import EventIcon from "@mui/icons-material/Event";
import Delete from "@mui/icons-material/Delete";
import Restore from "@mui/icons-material/Restore";
import { Edit as EditIcon } from "@mui/icons-material";

/* Utils */
import {
 $firebase_auth_onAuth,
 $firebase_database,
 $firebase_auth_check_admin,
 $firebase_database_delete,
} from "./utils/Firebase";
import { $firebase_database_read } from "./utils/Firebase";
import { ref, set } from "@firebase/database";

function Recycle() {
 /*** FIREBASE ***/
 const [auth, setAuth] = React.useState(null);
 const [allPosts, setAllPosts] = React.useState([]);

 const [errorAlert, setErrorAlert] = React.useState("");
 const [openAlert, setOpenAlert] = React.useState(false);
 const [snackbarAlert, setSnackbarAlert] = React.useState(false);
 const [openSnackbar, setOpenSnackbar] = React.useState(false);
 const [openPostRestore, setOpenPostRestore] = React.useState([false, null]);
 const [refresh, setRefresh] = React.useState(0);

 const PostsButtons = ({ post }) => (
  <>
   <IconButton
    aria-label="edit"
    sx={{ marginLeft: "auto", marginTop: -1 }}
    size="small"
    color="primary"
    onClick={() => {
     setOpenPostRestore([true, post]);
    }}
   >
    <Restore />
   </IconButton>
  </>
 );

 React.useEffect(() => {
  $firebase_auth_onAuth((user) => {
   if (user) {
    $firebase_auth_check_admin((admin) => {
     if (admin) {
      setAuth(true);
     } else {
      setAuth(false);
     }
    });
   } else {
    setAuth(false);
   }
  });
 }, []);

 React.useEffect(() => {
  $firebase_auth_onAuth((user) => {
   if (user) {
    $firebase_database_read("recycle/", (data) => {
     if (data) {
      let posts = [];
      for (let i in data) {
       posts.push(data[i]);
      }
      setAllPosts(posts);
     }
    });
   }
  });
 }, [refresh]);

 /*
 Delete Image

 if (p.picture && p.picture.includes(firebaseUrl)) {
      $firebase_storage_delete(
       "posts/" +
        p.picture
         .replace(firebaseUrl, "")
         .replace("?alt=media", "")
         .replace(/&token=[a-zA-Z0-9-_.]+&?/g, ""),
       () => {
        deletePost();
       },
       (e) => {
        if (
         e.message.includes("does not exist") ||
         e.message.includes("(storage/object-not-found)")
        ) {
         deletePost();
        } else {
         setOpenAlert(true);
         setErrorAlert(e.message);
        }
       }
      );
     } else {
      deletePost();
     }
 */

 return (
  <>
   <Navbar auth={auth} />
   {auth == true && (
    <>
     <Modal
      title="Posts"
      body={errorAlert}
      isOpen={openAlert}
      onCancel={() => {
       setOpenAlert(false);
       setErrorAlert("");
      }}
     />
     <Modal
      title="Restore"
      submitButton="Restore"
      body="Are you sure you want to restore this post?"
      isOpen={openPostRestore[0]}
      onCancel={() => {
       setOpenPostRestore([false, null]);
      }}
      onSubmit={() => {
       $firebase_database_read("posts/", (d) => {
        function restorePost() {
         let posts = d;
         if (posts === null) {
          set(ref($firebase_database, "posts/"), [
           {
            ...openPostRestore[1],
            recycledTime: null,
           },
          ]);
         } else {
          posts.push({
           ...openPostRestore[1],
           recycledTime: null,
          });
          set(ref($firebase_database, "posts/"), posts);
         }
         $firebase_database_delete(
          "recycle/" +
           openPostRestore[1].id +
           "+" +
           openPostRestore[1].recycledTime,
          (e) => {}
         );
         setOpenPostRestore([false, null]);
         setOpenSnackbar(true);
         setSnackbarAlert("Post restored!");
         setRefresh(refresh + 1);
         setRefresh(refresh + 1);
        }
        if (d) {
         let permit = true;
         for (let i in d) {
          if (d[i].id === openPostRestore[1].id) {
           permit = false;
          }
         }
         if (permit === true) restorePost();
         else {
          setOpenPostRestore([false, null]);
          setOpenSnackbar(true);
          setSnackbarAlert("The post is already available with same ID!");
         }
        }
       });
      }}
     />
     <Alert
      color={
       (snackbarAlert &&
       snackbarAlert
        .toLowerCase()
        .match(
         /(error|sorry|unsuccessful|failed|wrong|invalid|not found|deleted)/g
        )
        ? "error"
        : false) || false
      }
      body={snackbarAlert}
      isOpen={openSnackbar}
      onCancel={() => {
       setOpenSnackbar(false);
       setSnackbarAlert("");
      }}
     />
     <Container maxWidth="xl" sx={{ marginTop: 4, marginBottom: 5 }}>
      <Grid container spacing={4}>
       <Grid item xs={12} md={6}>
        <Typography variant="h6" style={{ paddingBottom: "0.2rem" }}>
         Recycle Bin
        </Typography>
        {allPosts.length === 0 ? (
         <p style={{ paddingTop: "1rem", color: "#666" }}>
          No posts yet or an error occured!
         </p>
        ) : (
         allPosts
          .sort(
           (a, b) =>
            new Date(b.date || b.start).getTime() -
            new Date(a.date || a.start).getTime()
          )
          .map((p, i) => {
           return (
            p && (
             <Card sx={{ marginTop: 2, padding: 2 }} elevation={1}>
              <h4>{p.title}</h4>
              <p
               style={{
                color: "gray",
                fontSize: "0.93rem",
                padding: "0.66rem 0",
               }}
              >
               {p.body.substring(0, 500).replaceAll("\\n", " ")}
              </p>
              {p.type == "post" && (
               <p
                style={{
                 fontSize: "0.8rem",
                 display: "flex",
                }}
               >
                <Chip
                 label={new Date(p.date).toDateString()}
                 size="small"
                 sx={{ marginRight: "0.3rem" }}
                />
                <Chip label={p.author} size="small" />
                <PostsButtons post={p} />
               </p>
              )}
              {p.type == "event" && (
               <p
                style={{
                 width: "100%",
                 fontSize: "0.8rem",
                 display: "flex",
                }}
               >
                <EventIcon
                 color="info"
                 sx={{
                  display: {
                   xs: "none",
                   md: "block",
                  },
                 }}
                />
                <Typography variant="p">
                 <Chip
                  label={p.start}
                  size="small"
                  sx={{ marginRight: "0.3rem" }}
                 />
                 to
                 <Chip
                  label={p.end}
                  size="small"
                  sx={{ marginLeft: "0.3rem" }}
                 />
                </Typography>
                <PostsButtons post={p} />
               </p>
              )}
              {p.picture && (
               <a href={p.picture} target="_blank" rel="noreferrer">
                <img
                 src={p.picture}
                 alt={p.title}
                 style={{
                  marginTop: "1rem",
                  maxWidth: "100px",
                  maxHeight: "100px",
                  cursor: "pointer",
                 }}
                />
               </a>
              )}
             </Card>
            )
           );
          })
        )}
       </Grid>
       <Grid item xs={12} md={6}></Grid>
      </Grid>
     </Container>
    </>
   )}
   {auth == false && <Guest auth2={auth} />}
   {auth == null && (
    <Box
     sx={{
      display: "flex",
      width: "100%",
      minHeight: "90vh",
      justifyContent: "center",
      alignItems: "center",
     }}
    >
     <CircularProgress />
    </Box>
   )}
  </>
 );
}

export default Recycle;
