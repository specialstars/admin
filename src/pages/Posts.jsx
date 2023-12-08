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
import { Edit as EditIcon } from "@mui/icons-material";

/* Utils */
import {
 $firebase_auth_onAuth,
 $firebase_database,
 $firebase_storage_delete,
 $firebase_database_delete,
 $firebase_database_write,
 $firebase_auth_check_admin,
} from "./utils/Firebase";
import { $firebase_database_read } from "./utils/Firebase";
import { push, ref } from "@firebase/database";

function Posts() {
 /*** FIREBASE ***/
 const [auth, setAuth] = React.useState(null);
 const [allPosts, setAllPosts] = React.useState([]);
 const [posts, setPosts] = React.useState([]);
 const [events, setEvents] = React.useState([]);

 const [errorAlert, setErrorAlert] = React.useState("");
 const [openAlert, setOpenAlert] = React.useState(false);
 const [openPostDelete, setOpenPostDelete] = React.useState({
  flag: false,
  post: null,
 });
 const [snackbarAlert, setSnackbarAlert] = React.useState(false);
 const [openSnackbar, setOpenSnackbar] = React.useState(false);
 const [openEdit, setOpenEdit] = React.useState([false, null]);

 const [refresh, setRefresh] = React.useState(0);

 const PostsButtons = ({ post }) => (
  <>
   <IconButton
    aria-label="edit"
    sx={{ marginLeft: "auto", marginTop: -1 }}
    size="small"
    color="primary"
    onClick={() => {
     setOpenEdit([true, post]);
    }}
   >
    <EditIcon />
   </IconButton>
   <IconButton
    aria-label="delete"
    sx={{ marginTop: -1 }}
    size="small"
    color="error"
    onClick={() => {
     setOpenPostDelete({
      flag: true,
      post,
     });
    }}
   >
    <Delete />
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
    $firebase_database_read("posts/", (data) => {
     let dataPosts = [];
     let dataEvents = [];
     if (data) {
      setAllPosts(data);
      data.map((p) => {
       if (p.type === "post") {
        dataPosts.push(p);
       } else if (p.type === "event") {
        dataEvents.push(p);
       }
      });
     }
     setEvents(dataEvents || []);
     setPosts(dataPosts || []);
    });
   }
  });
 }, [refresh]);

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
      title="Move to Recycle Bin"
      submitButton="Delete"
      body="Are you sure you want to delete this post?"
      isOpen={openPostDelete.flag}
      onCancel={() => {
       setOpenPostDelete({
        flag: false,
        post: null,
       });
      }}
      onSubmit={() => {
       let firebaseUrl =
        "https://firebasestorage.googleapis.com/v0/b/specialstars-dev.appspot.com/o/posts%2F";
       let p = openPostDelete.post;
       function deletePost(permit) {
        console.log(allPosts);
        let uniqueIndex =
         allPosts.findIndex((post) => post && post.id && post.id === p.id) ||
         false;
        if (uniqueIndex && typeof uniqueIndex === "number") {
         let DT = new Date().getTime();
         $firebase_database_delete(
          "posts/" + uniqueIndex,
          () => {
           if (permit === true) {
            $firebase_database_write(
             "recycle/" + p.id + "+" + DT,
             {
              ...p,
              recycledTime: DT,
             },
             () => {},
             () => {}
            );
           }
           setRefresh((rf) => rf + 1);
           setOpenSnackbar(true);
           setSnackbarAlert("Moved to recycle bin.");
          },
          (e) => {
           setErrorAlert(e);
           setOpenAlert(true);
          }
         );
        } else {
         setRefresh((rf) => rf + 1);
         setOpenSnackbar(true);
         setSnackbarAlert("Something went wrong.");
        }
       }
       $firebase_database_read("recycle/", (data) => {
        if (data) {
         let permit = true;
         for (let i in data) {
          if (data[i].id === openPostDelete.post.id) {
           permit = false;
          }
         }
         if (permit === true) deletePost(true);
         else {
          setOpenSnackbar(true);
          setSnackbarAlert(
           "This post is already in the recycle bin, we are resolving duplication."
          );
          setTimeout(() => {
           deletePost(false);
          }, 2000);
         }
        }
       });
       setOpenPostDelete({
        flag: false,
        post: null,
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
     <Edit
      isOpen={openEdit[0]}
      type={openEdit[1] ? openEdit[1].type : "Post"}
      post={openEdit[1]}
      onCancel={() => {
       setOpenEdit(false, null);
       setRefresh((rf) => rf + 1);
       setRefresh((rf) => rf + 1);
      }}
      onEdited={() => {
       setOpenSnackbar(true);
       setSnackbarAlert("Successfully edited.");
       setRefresh((rf) => rf + 1);
      }}
     />
     <Container maxWidth="xl" sx={{ marginTop: 4, marginBottom: 5 }}>
      <Grid container spacing={4}>
       <Grid item xs={12} md={6}>
        <Typography variant="h6" style={{ paddingBottom: "0.2rem" }}>
         Post Category
        </Typography>
        {posts.length === 0 ? (
         <p style={{ paddingTop: "1rem", color: "#666" }}>
          No posts yet or an error occured!
         </p>
        ) : (
         Array.from(posts)
          .sort(
           (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 10)
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
        <Typography variant="h6" style={{ padding: "2.5rem 0 0.2rem 0" }}>
         Event Category
        </Typography>
        {events.length === 0 ? (
         <p style={{ paddingTop: "1rem", color: "#666" }}>
          No events yet or an error occured!
         </p>
        ) : (
         Array.from(events)
          .sort(
           (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
          )
          .slice(0, 10)
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
             </Card>
            )
           );
          })
        )}
       </Grid>
       <Grid item xs={12} md={6}>
        <Typography variant="h6" style={{ paddingBottom: "0.2rem" }}>
         All Categories
        </Typography>
        {allPosts.length === 0 ? (
         <p style={{ paddingTop: "1rem", color: "#666" }}>
          No posts yet or an error occured!
         </p>
        ) : (
         Array.from(allPosts)
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

export default Posts;
