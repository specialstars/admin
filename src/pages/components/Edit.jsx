import React from "react";
import { styled } from "@mui/material/styles";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";
import { Delete } from "@mui/icons-material";

const VisuallyHiddenInput = styled("input")({
 clip: "rect(0 0 0 0)",
 clipPath: "inset(50%)",
 height: 1,
 overflow: "hidden",
 position: "absolute",
 bottom: 0,
 left: 0,
 whiteSpace: "nowrap",
 width: 1,
});

import {
 $firebase_storage_upload,
 $firebase_storage_delete,
 $firebase_database_read,
 $firebase_database,
} from "./../utils/Firebase";
import { getDownloadURL } from "@firebase/storage";
import { ref, set, push } from "@firebase/database";

export default function Edit({
 isOpen,
 onCancel,
 type = "post",
 onEdited,
 post = {},
}) {
 const [showLoading, setShowLoading] = React.useState(false);
 const [open, setOpen] = React.useState(false);
 const [submitDisabled, setSubmitDisabled] = React.useState(true);
 const [uploadingDisabled, setUploadingDisabled] = React.useState(false);
 const exampleEvent = {
  start: null,
  end: null,
  place: null,
  link: null,
  status: "Upcoming",
  tid: "",
  time: null,
 };
 const [tabValue, setTabValue] = React.useState("1");
 const [tags, setTags] = React.useState([]);
 const [author, setAuthor] = React.useState("");
 const [title, setTitle] = React.useState("");
 const [body, setBody] = React.useState("");
 const [image, setImage] = React.useState(false);
 const [imageURL, setImageURL] = React.useState(false);
 const [startDate, setStartDate] = React.useState(null);
 const [endDate, setEndDate] = React.useState(null);
 const [event, setEvent] = React.useState(exampleEvent);
 const [errMsg, setErrMsg] = React.useState("");

 const updateThePost = () => {
  let updatedPost = {
   title: title,
   body: body.replaceAll(/\n/g, "\\n"),
   tags: (typeof tags == "string" ? tags.split(", ") : tags) || [],
   author: author || "Admin",
  };
  if (post.type === "event") {
   updatedPost = {
    ...updatedPost,
    date: null,
    author: null,
    picture: null,
    tags: null,
    ...event,
   };
  }
  $firebase_database_read(
   "posts/",
   (d) => {
    if (d) {
     let posts = d;
     for (let i = 0; i < d.length; i++) {
      if (d[i].title == post.title && d[i].body == post.body) {
       if (d[i].picture && d[i].picture != post.picture) return;
       if (d[i].author && d[i].author != post.author) return;
       if (d[i].type == "event") {
        if (d[i].start != post.start) return;
        if (d[i].end != post.end) return;
       }
       posts[i] = {
        ...posts[i],
        ...updatedPost,
       };
       console.log({
        ...posts[i],
        ...updatedPost,
       });
      }
     }
     set(ref($firebase_database, "posts/"), posts);
     onEdited();
    }
   },
   () => {
    setOpen(false);
    onCancel(open);
   }
  );
 };

 const checkRequiredFields = () => {
  let a = document.getElementById("name"),
   b = document.getElementById("body"),
   c = document.getElementById("start"),
   d = document.getElementById("end");
  if (title === "") {
   if (a) a.focus();
   return "Title is required";
  } else if (body === "") {
   if (b) b.focus();
   return "Body is required";
  } else if (type === "event") {
   if (startDate === null) {
    if (c) c.focus();
    return "Starting date is required";
   } else if (endDate === null) {
    if (d) d.focus();
    return "Ending date is required";
   } else if (event.place === null) {
    return "Place name is required";
   } else {
    return true;
   }
  } else {
   return true;
  }
 };

 const clearForm = () => {
  setTitle("");
  setBody("");
  setTags([]);
  setAuthor("");
  setImage(false);
  setImageURL(false);
  setStartDate(null);
  setEndDate(null);
  setEvent(exampleEvent);
 };

 const handleClose = (e, reason) => {
  function o() {
   setOpen(false);
   onCancel(open);
   clearForm();
   setTabValue("1");
  }
  if (reason === "backdropClick") return;
  o();
 };

 const handleUpload = () => {
  let image = document.getElementById("file").files[0];
  setUploadingDisabled(true);
  setSubmitDisabled(true);
  $firebase_storage_upload(`posts/${image.name}`, image, (k) => {
   k.then((snapshot) => {
    getDownloadURL(snapshot.ref).then((downloadURL) => {
     setImageURL(downloadURL);
     setImage(downloadURL);
     setUploadingDisabled(false);
     document.getElementById("fileMain").style.display = "none";
     $firebase_database_read("posts/", (d) => {
      if (d) {
       let posts = Array.from(d);
       for (let i = 0; i < d.length; i++) {
        if (d[i].title == post.title && d[i].body == post.body) {
         if (d[i].picture && d[i].picture != post.picture) return;
         if (d[i].author && d[i].author != post.author) return;
         posts[i].picture = downloadURL;
        }
       }
       set(ref($firebase_database, "posts/"), posts);
      }
      return true;
     });
    });
   }).catch((error) => {
    return false;
   });
   return false;
  });
 };

 const handleConfirm = (e) => {
  let x = checkRequiredFields();
  if (x !== true) {
   e.preventDefault();
   setErrMsg("* " + x);
   return;
  } else setErrMsg("");
  if (submitDisabled === false) {
   updateThePost();
   setShowLoading(true);
   setSubmitDisabled(true);
   setTimeout(() => {
    setShowLoading(false);
    setSubmitDisabled(false);
    setOpen(false);
    onCancel(open);
    clearForm();
   }, 2000);
  }
 };

 React.useEffect(() => {
  setOpen(isOpen);
  setErrMsg("");
 }, [isOpen]);

 React.useEffect(() => {
  if (post && post.title) {
   let a = post.title,
    b = post.body,
    c = post.tags,
    d = post.author || "Admin",
    e = post.picture;
   setTitle(a);
   if (b)
    setBody(
     /* this (``) will produce line break, don't remove this */
     b.replaceAll(
      "\\n",
      `
`
     )
    );
   if (c) setTags(typeof c == "string" ? c : c.join(", "));
   if (d) setAuthor(d);
   if (e) setImage(e), setImageURL(e);
   if (type.toLowerCase() == "event") {
    setStartDate(post.start);
    setEndDate(post.end);
    setEvent({
     start: post.start || null,
     end: post.end || null,
     place: post.place || null,
     link: post.link || null,
     status: post.status || "Upcoming",
     tid: post.tid || "",
     time: post.time || null,
    });
   }
  }
 }, [post]);

 React.useEffect(() => {
  let flag = true;
  if (post) {
   function o(p) {
    setSubmitDisabled(p);
   }
   function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
     if (a[i] !== b[i]) return false;
    }
    return true;
   }
   if (
    (title && title !== post.title) ||
    (body && body.replaceAll(/\n/g, "\\n") !== post.body)
   ) {
    flag = false;
   }
   if (
    (post.tags && !arraysEqual(post.tags, tags.split(", "))) ||
    (!post.tags && tags.length > 0) ||
    (post.author && author && post.author !== author)
   ) {
    flag = false;
   }
   if (type === "event") {
   }
   o(flag);
  }
 }, [title, body, tags, author, startDate, endDate, event]);

 return (
  <div>
   <Dialog open={open} onClose={handleClose} transitionDuration={0}>
    <DialogTitle>Edit {type}</DialogTitle>
    <DialogContent>
     {showLoading ? (
      <div
       style={{
        minWidth: "300px",
        height: "100px",
        marginTop: "1rem",
       }}
      >
       <LinearProgress />
      </div>
     ) : (
      <>
       <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
         value={tabValue}
         onChange={(e, newValue) => {
          setTabValue(newValue);
         }}
        >
         <Tab label="Required" value="1" />
         <Tab label="Optional" value="2" />
        </Tabs>
       </Box>
       <br />
       <div
        style={{
         padding: "0 0.5rem",
        }}
       >
        <div
         style={{
          display: tabValue === "1" ? "block" : "none",
         }}
        >
         <TextField
          id="name"
          margin="dense"
          label="Title"
          type="text"
          fullWidth
          variant="outlined"
          sx={{ marginBottom: "1rem" }}
          placeholder="Type the title here"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
         />
         <TextField
          margin="dense"
          id="body"
          label="Body"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={10}
          sx={{ marginBottom: "1rem" }}
          placeholder="Type something here"
          onChange={(e) => setBody(e.target.value)}
          value={body}
         />
         <div
          style={{
           display: type === "event" ? "" : "none",
          }}
         >
          <div
           style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
           }}
          >
           <TextField
            margin="dense"
            id="start"
            type="date"
            variant="standard"
            sx={{ marginBottom: "1rem" }}
            value={startDate}
            onInput={(e) => {
             setStartDate(e.target.value);
             setEvent({
              ...event,
              start: new Date(e.target.value).toJSON().slice(0, 10),
             });
            }}
           />
           <p
            style={{
             margin: "0 1rem",
            }}
           >
            to
           </p>
           <TextField
            margin="dense"
            id="end"
            type="date"
            variant="standard"
            sx={{ marginBottom: "1rem" }}
            value={endDate}
            onInput={(e) => {
             setEndDate(e.target.value);
             setEvent({
              ...event,
              end: new Date(e.target.value).toJSON().slice(0, 10),
             });
            }}
           />
          </div>
          <TextField
           id="place"
           label="Place"
           margin="dense"
           type="text"
           variant="standard"
           fullWidth
           sx={{ marginBottom: "1rem" }}
           placeholder="Dhaka, Bangladesh"
           value={event.place}
           onChange={(e) => {
            setEvent({ ...event, place: e.target.value });
           }}
          />
         </div>
        </div>
        <div
         style={{
          display: tabValue === "2" ? "block" : "none",
         }}
        >
         <Box
          component="div"
          sx={{
           border: "1px dashed grey",
           width: "300px",
           height: "200px",
           marginBottom: "1rem",
           display: type === "event" ? "none" : "",
          }}
         >
          <img
           src={image !== false ? image : "https://via.placeholder.com/300x200"}
           style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
           }}
          />
         </Box>
         <Button
          id="fileMain"
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          disabled={uploadingDisabled}
          sx={{
           margin: "0 1rem 1rem 0",
           display: type === "event" ? "none" : "",
          }}
          onClick={() => {
           if (image !== imageURL) {
            handleUpload();
           }
          }}
         >
          <div style={{ display: image !== imageURL && "none" }}>
           Upload new image
           <VisuallyHiddenInput
            id="file"
            type="file"
            accept="image/*"
            disabled={image !== imageURL && true}
            onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
           />
          </div>
          <div style={{ display: image === imageURL && "none" }}>
           Upload now
          </div>
         </Button>
         <Button
          id="deleteImgBtn"
          component="label"
          variant="contained"
          color="error"
          startIcon={<Delete />}
          sx={{
           marginBottom: "1rem",
           display:
            type === "event"
             ? "none"
             : post && post.picture && post.picture != ""
             ? ""
             : "none",
          }}
          disabled={uploadingDisabled}
          onClick={() => {
           if (image !== imageURL) {
            setImage(imageURL);
           } else {
            setUploadingDisabled(true);
            setSubmitDisabled(true);
            $firebase_database_read("posts/", (d) => {
             if (d) {
              let posts = Array.from(d);
              for (let i = 0; i < d.length; i++) {
               if (
                d[i].title == post.title &&
                d[i].body == post.body &&
                d[i].picture == post.picture &&
                d[i].author == post.author &&
                d[i].tags == post.tags
               ) {
                posts[i].picture = "";
               }
              }
              set(ref($firebase_database, "posts/"), posts);
             }
             return true;
            });
            function o() {
             setImage(null);
             setImageURL(null);
             setUploadingDisabled(false);
             document.getElementById("fileMain").style.display = "";
            }
            $firebase_storage_delete(
             `posts/${decodeURIComponent(
              imageURL
               .replace(
                "https://firebasestorage.googleapis.com/v0/b/specialstars-dev.appspot.com/o/posts%2F",
                ""
               )
               .replace("?alt=media", "")
               .replace(/&token=[a-zA-Z0-9-_.]+&?/g, "")
             )}`,
             () => {
              o();
             },
             () => {
              o();
             }
            );
           }
          }}
         >
          {image === imageURL ? "Delete the image" : "Discard change"}
         </Button>
         <div
          style={{
           display: type === "event" ? "" : "none",
           marginBottom: "3rem",
          }}
         >
          <TextField
           margin="dense"
           id="link"
           label="Link"
           type="text"
           variant="standard"
           fullWidth
           sx={{ marginBottom: "1rem" }}
           placeholder="https://example.com/event?q="
           onChange={(e) => {
            setEvent({ ...event, link: e.target.value });
           }}
           value={event.link}
          />
          <TextField
           margin="dense"
           id="time"
           label="Time"
           type="text"
           variant="standard"
           sx={{ marginBottom: "1rem" }}
           placeholder="10:00 AM - 12:00 PM"
           onChange={(e) => {
            setEvent({ ...event, time: e.target.value });
           }}
           value={event.time}
          />
         </div>
         <Divider
          sx={{
           margin: "1rem 0",
          }}
         />
         <div style={{ display: "flex" }}>
          <TextField
           margin="dense"
           id="author"
           label="Author"
           type="text"
           variant="standard"
           sx={{ marginBottom: "1rem", marginRight: "0.7rem" }}
           placeholder="Enter the author name"
           onChange={(e) => setAuthor(e.target.value)}
           value={author}
          />
          <TextField
           margin="dense"
           id="tags"
           label="Tags"
           type="text"
           variant="standard"
           sx={{ marginBottom: "1rem" }}
           placeholder="Tag1, Tag2, Tag3"
           onChange={(e) => setTags(e.target.value)}
           value={Array.isArray(tags) ? tags.join(",") : tags}
          />
         </div>
        </div>
       </div>
      </>
     )}
    </DialogContent>
    <p style={{ color: "red", width: "100%", padding: "0.5rem 2rem" }}>
     {errMsg}
    </p>
    <DialogActions>
     <Button onClick={handleClose} disabled={uploadingDisabled}>
      Discard
     </Button>
     <Button
      type="submit"
      onClick={handleConfirm}
      id="submitButton"
      disabled={submitDisabled}
     >
      {type === "event" ? "Update the event" : "Update the post"}
     </Button>
    </DialogActions>
   </Dialog>
  </div>
 );
}
