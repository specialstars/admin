import * as React from "react";

/* Components */
import Create from "./Create";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Modal from "./Modal";
import Alert from "./Alert";
import Edit from "./Edit";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";

/* Icons */
import PostIcon from "@mui/icons-material/PostAdd";
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
} from "../utils/Firebase";
import { $firebase_database_read } from "../utils/Firebase";
import { TextField } from "@mui/material";
import { push, ref } from "@firebase/database";

export default function Dashboard() {
 const [tabValue, setTabValue] = React.useState("1");
 const [isOpenCreateNew, setIsOpenCreateNew] = React.useState([false, ""]);

 /*** FIREBASE ***/
 const [allPosts, setAllPosts] = React.useState([]);
 const [postAndEvent, setPostAndEvent] = React.useState([]);
 const [latestPosts, setLatestPosts] = React.useState([]);
 const [events, setEvents] = React.useState([]);
 const [posts, setPosts] = React.useState([]);
 const [admins, setAdmins] = React.useState([]);

 const [errorAlert, setErrorAlert] = React.useState("");
 const [openAlert, setOpenAlert] = React.useState(false);
 const [openAdminDelete, setOpenAdminDelete] = React.useState({
  flag: false,
  admin: null,
 });
 const [openPostDelete, setOpenPostDelete] = React.useState({
  flag: false,
  post: null,
 });
 const [snackbarAlert, setSnackbarAlert] = React.useState(false);
 const [openSnackbar, setOpenSnackbar] = React.useState(false);
 const [openEdit, setOpenEdit] = React.useState([false, null]);

 const [refresh, setRefresh] = React.useState(0);

 const InsightsComponent = () => (
  <Paper elevation={0}>
   <h4
    style={{
     paddingBottom: "0.2rem",
    }}
   >
    Basic Insights
   </h4>
   <Card
    elevation={0}
    sx={{
     marginTop: 2,
     padding: 2,
     display: "flex",
     justifyContent: "space-around",
     alignItems: "center",
     lineHeight: "2rem",
     minHeight: "260px",
     bgcolor: "background.default",
     border: "1px solid rgba(0,0,0,0.05)",
    }}
   >
    <div style={{ textAlign: "center" }}>
     <Chip label="All Categories" />
     <Typography variant="h6" display="block">
      {postAndEvent.length}
     </Typography>
     <br />
     <Chip label="Today's Posts" />
     <Typography variant="h6" display="block">
      {
       Array.from(posts).filter(
        (p) => new Date(p.date).toDateString() === new Date().toDateString()
       ).length
      }
     </Typography>
    </div>
    <Divider orientation="vertical" variant="middle" flexItem />
    <div style={{ textAlign: "center" }}>
     <Chip label="Post Category" />
     <Typography variant="h6" display="block">
      {posts.length}
     </Typography>
     <br />
     <Chip label="Event Category" />
     <Typography variant="h6" display="block">
      {events.length}
     </Typography>
    </div>
   </Card>
  </Paper>
 );
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
     setPostAndEvent(dataPosts.concat(dataEvents) || []);
     setEvents(dataEvents || []);
     setPosts(dataPosts || []);
     setLatestPosts(
      dataPosts.slice().sort((a, b) => {
       if (a.date && b.date) {
        return new Date(b.date) - new Date(a.date);
       }
       return 0;
      })
     );
    });
    $firebase_database_read("admins/", (data) => {
     if (data) {
      setAdmins(data);
     }
    });
   }
  });
 }, [refresh]);

 return (
  <>
   <Modal
    title="Dashboard"
    body={errorAlert}
    isOpen={openAlert}
    onCancel={() => {
     setOpenAlert(false);
     setErrorAlert("");
    }}
   />
   <Modal
    title="Delete"
    body="Are you sure you want to remove this person?"
    submitButton="Remove"
    isOpen={openAdminDelete.flag}
    onCancel={() => {
     setOpenAdminDelete({ flag: false, admin: null });
    }}
    onSubmit={() => {
     $firebase_database_read("owners/", (data) => {
      if (data) {
       if (data.includes(openAdminDelete.admin)) {
        setOpenSnackbar(true);
        setSnackbarAlert("Sorry, you cannot delete this root admin.");
       } else {
        $firebase_database_delete(
         "admins/" + admins.indexOf(openAdminDelete.admin),
         () => {
          setRefresh((rf) => rf + 1);
          setOpenSnackbar(true);
          setSnackbarAlert("Successfully deleted.");
         },
         (e) => {
          setErrorAlert(e);
          setOpenAlert(true);
         }
        );
       }
      }
     });
     setOpenAdminDelete({ admin: null });
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
    <Grid container spacing={3}>
     <Grid item xl={8} xs={12}>
      <Paper sx={{ minHeight: "375px", padding: 4, paddingBottom: 6 }}>
       <h2
        style={{
         paddingBottom: "0.5rem",
         display: "flex",
         alignItems: "center",
        }}
       >
        Dashboard
        <Button
         sx={{ marginLeft: "auto" }}
         size="small"
         variant="outlined"
         onClick={() => {
          setRefresh((rf) => rf + 1);
         }}
        >
         Refresh
        </Button>
       </h2>
       <Tabs
        value={tabValue}
        onChange={(e, newValue) => {
         setTabValue(newValue);
        }}
        variant=""
        sx={{
         marginBottom: 1,
         marginTop: 1,
         borderBottom: 1,
         borderColor: "divider",
        }}
       >
        <Tab label="Home" value="1" />
        <Tab label="Manage" value="2" />
        <Tab
         label="Insights"
         value="3"
         sx={{
          display: {
           xs: "inline-flex",
           md: "none",
          },
         }}
        />
       </Tabs>
       <div
        style={{
         padding: "0 0.5rem",
        }}
       >
        <br />
        {tabValue === "1" && (
         <>
          <Grid container spacing={3}>
           <Grid item xs={12} md={6}>
            <Button
             variant="contained"
             onClick={() => setIsOpenCreateNew([true, "Post"])}
             startIcon={<PostIcon />}
            >
             New Post
            </Button>
            <br />
            <Button
             variant="contained"
             style={{ marginTop: "1rem" }}
             onClick={() => setIsOpenCreateNew([true, "Event"])}
             startIcon={<EventIcon />}
            >
             New Event
            </Button>
           </Grid>
           <Grid item xs={12} md={6}>
            <Button
             variant="contained"
             color="error"
             startIcon={<Delete />}
             disabled
            >
             Empty the Recycle Bin
            </Button>
            <br />
            <Button
             variant="contained"
             style={{ marginTop: "1rem" }}
             startIcon={<Delete />}
             disabled
            >
             Terminate all Events
            </Button>
           </Grid>
          </Grid>
          <Create
           isOpen={isOpenCreateNew[0]}
           onCancel={() => {
            setIsOpenCreateNew([false, ""]);
           }}
           onCreated={() => {
            setIsOpenCreateNew([false, ""]);
            setRefresh((rf) => rf + 1);
            setTimeout(() => {
             setOpenSnackbar(true);
             setSnackbarAlert(
              "The " +
               isOpenCreateNew[1].toLocaleLowerCase() +
               " has been successfully created."
             );
            }, 700);
           }}
           type={isOpenCreateNew[1]}
          />
         </>
        )}
        {tabValue === "2" && (
         <>
          <h4
           style={{
            paddingBottom: "1rem",
           }}
          >
           Manage Admins
          </h4>
          <div style={{ display: "flex", alignItems: "center" }}>
           <TextField
            type="email"
            label="Add Admin"
            variant="outlined"
            size="small"
            id="addEmailOfAdmin"
            sx={{ marginRight: "1rem" }}
           />
           <Button
            variant="contained"
            onClick={() => {
             const i = document.getElementById("addEmailOfAdmin");
             if (i.value.match(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)) {
              if (admins.includes(i.value))
               return (
                setOpenSnackbar(true),
                setSnackbarAlert("This email is already an admin.")
               );
              $firebase_database_write(
               "admins/" + admins.length,
               i.value,
               () => {
                setRefresh((rf) => rf + 1);
                setOpenSnackbar(true);
                setSnackbarAlert("Successfully added.");
                i.value = "";
               },
               (e) => {
                setErrorAlert(e);
                setOpenAlert(true);
               }
              );
             } else {
              i.focus();
             }
            }}
           >
            Add
           </Button>
          </div>
          <List
           dense
           sx={{
            width: "100%",
            maxWidth: 360,
            bgcolor: "background.paper",
            marginTop: "1rem",
           }}
          >
           {admins.map((value) => {
            const labelId = `checkbox-list-secondary-label-${value}`;
            return (
             <ListItem
              key={value}
              secondaryAction={
               <Button
                size="small"
                color="error"
                onClick={function () {
                 setOpenAdminDelete({ flag: true, admin: value });
                }}
               >
                <Delete />
               </Button>
              }
              disablePadding
             >
              <ListItemButton>
               <ListItemAvatar>
                <Avatar alt={`Avatar`} />
               </ListItemAvatar>
               <ListItemText id={labelId} primary={`${value}`} />
              </ListItemButton>
             </ListItem>
            );
           })}
          </List>
         </>
        )}
        {tabValue === "3" && <InsightsComponent />}
       </div>
      </Paper>
      <Paper
       sx={{
        padding: 4,
        marginTop: 3,
       }}
      >
       <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
         <Typography variant="h6" style={{ paddingBottom: "0.2rem" }}>
          Latest Posts
         </Typography>
         <Card
          elevation={0}
          sx={{
           height: "360px",
           overflowY: "scroll",
           bgcolor: "background.default",
           padding: "0 1rem 2rem 1rem",
           marginTop: 2,
           border: "1px solid rgba(0,0,0,0.05)",
          }}
         >
          {latestPosts.length === 0 ? (
           <p style={{ paddingTop: "1rem", color: "#666" }}>
            No posts yet or an error occured!
           </p>
          ) : (
           Array.from(latestPosts)
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
                 {p.body.substring(0, 200).replaceAll("\\n", " ")}
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
               </Card>
              )
             );
            })
          )}
         </Card>
        </Grid>
        <Grid item xs={12} md={6}>
         <Typography variant="h6" style={{ paddingBottom: "0.2rem" }}>
          Post & Event
         </Typography>
         <Card
          elevation={0}
          sx={{
           height: "360px",
           overflowY: "scroll",
           bgcolor: "background.default",
           padding: "0 1rem 2rem 1rem",
           marginTop: 2,
           border: "1px solid rgba(0,0,0,0.05)",
          }}
         >
          {postAndEvent.length === 0 ? (
           <p style={{ paddingTop: "1rem", color: "#666" }}>
            No posts yet or an error occured!
           </p>
          ) : (
           Array.from(postAndEvent)
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
                 {p.body.substring(0, 200).replaceAll("\\n", " ")}
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
               </Card>
              )
             );
            })
          )}
         </Card>
        </Grid>
       </Grid>
      </Paper>
     </Grid>
     <Grid item xl={4} xs={12}>
      <Paper
       sx={{
        padding: 4,
        display: {
         xs: "none",
         md: "block",
        },
       }}
      >
       <InsightsComponent />
      </Paper>
     </Grid>
    </Grid>
   </Container>
  </>
 );
}
