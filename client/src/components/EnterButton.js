import React from "react";
import { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from 'react-select'
import { Typography } from "@material-ui/core";
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();



const useStyles = makeStyles({
    dialogTitle: {
        flex: "1 1 0%",
        color: ""
    },
    dialogTitleBox: {
        background: "linear-gradient(111.68deg, rgb(246 246 246) 0%, rgb(232, 242, 246) 100%)",
        alignItems: "center",
        width: "auto",
        justifyContent: "space-between",
        borderBottom: "1px solid rgb(231, 227, 235)",
        display: "flex",
        padding: "12px 24px",
        WebkitBoxAlign: "center",
    },
    dialogTitleCloseButton: {
        width: 48,
        float: "right",
    },
    dialogContentDescription: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },


    dialogContentTextBox: {
        backgroundColor: "rgb(238, 234, 244)",
        border: "1px solid rgb(215, 202, 236)",
        borderRadius: "16px",
        boxShadow: "rgb(237 75 158) 0px 0px 0px 1px, rgb(237 75 158 / 20%) 0px 0px 0px 4px",
        padding: "8px 16px",
    },

    dialogInput: {
        background: "#00000000",
        borderRadius: "0px",
        boxShadow: "none",
        paddingLeft: "0px",
        paddingRight: "0px",
        textAlign: "right",
        border: "none",
    },

    container: {
        display: "flex",
        flexWrap: "wrap",
    },

    formControl: {
        minWidth: 120,
        margin: 1,
    }

});

export default function EnterButton(){
    const [open, setOpen] = useState(true);
    const [state, setState] = useState({
        num1: 0,
        num2: 0,
        num3: 0,
        num4: 0,
        num5: 0,
        num6: 0,
    });
    const options = [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4'},
        { value: 5, label: '5'},
        { value: 6, label: '6'},
        { value: 7, label: '7'},
        { value: 8, label: '8'},
        { value: 9, label: '9'},
        { value: 10, label: '10'},
        { value: 11, label: '11'},
        { value: 12, label: '12'},
        { value: 13, label: '13'},
        { value: 14, label: '14'},
        { value: 15, label: '15'},
        { value: 16, label: '16'},
        { value: 17, label: '17'},
        { value: 18, label: '18'},
        { value: 19, label: '19'},
        { value: 20, label: '20'},
        { value: 21, label: '21'},
        { value: 22, label: '22'},
        { value: 23, label: '23'},
        { value: 24, label: '24'},
        { value: 25, label: '25'},
        { value: 26, label: '26'},
        { value: 27, label: '27'},
        { value: 28, label: '28'},
        { value: 29, label: '29'},
        { value: 30, label: '30'},
      ];

    const classes = useStyles();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClickClose = () => {
        setOpen(false);
    };

    const handleChange = e => {
        setState({
        ...state,
        [e.target.name]: e.target.value,
        })
    };
    return (
        <div>
          <Button variant="outlined" color="primary" onClick={handleClickOpen}>
            Open form dialog
          </Button>
          <Dialog 
            open={open} 
            onClose={handleClickClose} 
            aria-labelledby="form-dialog-title"
            PaperProps={{
                style: {
                    minWidth: 280,
                    maxWidth: 450,
                    width: "auto",
                    borderRadius: 32,
                    height: "40vh"
                }
            }}
            >
            <DialogTitle 
                id="form-dialog-title"
                style={{padding: 0}}
            >
                <div className={classes.dialogTitleBox}>
                    <div className={classes.dialogTitle}>
                        <Typography 
                            variant="h6"
                            style={{fontWeight: 600}}
                        >
                            Buy Tickets
                        </Typography>
                    </div>
                    <div>        
                        <IconButton 
                        aria-label="close" 
                        onClick={handleClickClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                </div>
            </DialogTitle>
            <DialogContent
                style={{
                    padding: 24
                }}>
                <form className={classes.container}>
                    <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="demo-dialog-native">Age</InputLabel>
                        <Select
                            native
                            value={state.num1}
                            onChange={handleChange}
                            input={<Input id="demo-dialog-native" />}
                        >
                            <option aria-label="None" value="" />
                            <option value={10}>Ten</option>
                            <option value={20}>Twenty</option>
                            <option value={30}>Thirty</option>
                        </Select>
                    </FormControl>
                </form>
            </DialogContent>
            <DialogActions style={{justifyContent: "center"}}>
              <Button onClick={handleClickClose} color="primary">
                Buy Ticket
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );

}