import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import abi from "../abis/Calend3.json";

import { ViewState, EditingState, IntegratedEditing} from '@devexpress/dx-react-scheduler';
import { Scheduler, WeekView, Appointments, AppointmentForm } from '@devexpress/dx-react-scheduler-material-ui';

import { Box, Button, Slider } from '@material-ui/core';
import Dialog from '@mui/material/Dialog';
import CircularProgress from '@mui/material/CircularProgress';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';


const contractAddress = "0x848ec29aBd54A1D1bb7119285962850f7CdC00F1";
const contractABI = abi.abi;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const contract = new ethers.Contract(contractAddress, contractABI, provider.getSigner());

console.log(contract);

const Calendar = (props) => {

    //state for admin and rate
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [rate, setRate] = useState(false);
    const [appointments, setAppointments] = useState([]);

    const [showDialog, setShowDialog] = useState(false);
    const [showSign, setShowSign] = useState(false);
    const [mined, setMined] = useState(false);
    const [transactionHash, setTransactionHash] = useState("");



    const getData = async () => {
        const owner = await contract.owner();
        console.log(owner);

        setIsAdmin(owner.toUpperCase() === props.account.toUpperCase());
        console.log(props.account.toUpperCase());

        const rate = await contract.getRate();
        console.log(rate.toString());
        setRate(ethers.utils.formatEther(rate.toString()));

        const appointmentData = await contract.getAppointments();
        console.log('appointments', appointmentData);

        transformAppointmentData(appointmentData);

    }

    const transformAppointmentData = (appointmentData) => {
        let data = [];
        appointmentData.forEach(appointment => {
            data.push({
                title: appointment.title,
                startDate: new Date(appointment.startTime * 1000),
                endDate: new Date(appointment.endTime * 1000),
            });
        });

        setAppointments(data);
    }

    useEffect(() => {
        getData();
    }, []);

    const saveAppointment = async (data) => {
        console.log('appointment saved');
        console.log(data);

        const appointment = data.added;
        const title = appointment.title;
        const startTime = appointment.startDate.getTime() / 1000;
        const endTime = appointment.endDate.getTime() / 1000;

        setShowSign(true);
        setShowDialog(true);
        setMined(false);
        try {
            const cost = ((endTime - startTime) / 60) * (rate * 100)/100;
            const msg = {value: ethers.utils.parseEther(cost.toString())};
            let transaction = await contract.createAppointment(title, startTime, endTime, msg);

            setShowSign(false);

            await transaction.wait();
    
            setMined(true);
            setTransactionHash(transaction.hash);

        } catch (error) {
            console.log(error);
        }
    }

    const saveRate = async () => {
        console.log('saving rate of ', ethers.utils.parseEther(rate.toString()));
        const tx = await contract.setRate(ethers.utils.parseEther(rate.toString()));
    }

    const handleSliderChange = (event, newValue) => {
        console.log('slider changed to', newValue);
        setRate(newValue);
    }

    const marks = [
        {
            value: 0.00,
            label: 'Free'
        },
        {
            value: 0.02,
            label: '0.02 ETH/min'
        },
        {
            value: 0.04,
            label: '0.04 ETH/min'
        },
        {
            value: 0.06,
            label: '0.06 ETH/min'
        },
        {
            value: 0.08,
            label: '0.08 ETH/min'
        },
        {
            value: 0.1,
            label: '0.1 ETH/min'
        }
    ]

    const Admin = () => {
        return <div id="admin">
            <Box>
                <h3>Set your minutely rate</h3>
                <Slider defaultValue = {parseFloat(rate)}
                    step={0.001}
                    min={0}
                    max = {0.1}
                    marks = {marks}
                    valueLabelDisplay = "auto"
                    onChangeCommitted={handleSliderChange} />
                <br /><br />
                <Button id={"settings-button"} onClick = {saveRate} variant = 'contained'>
                    <SettingsSuggestIcon /> save configuration</Button>
            </Box>
        </div>
    }

    const ConfirmDialog = () => {
        return <Dialog open={true}>
            <h3>
              {mined && 'Appointment Confirmed'}
              {!mined && !showSign && 'Confirming Your Appointment...'}
              {!mined && showSign && 'Please Sign to Confirm'}
            </h3>
            <div style={{textAlign: 'left', padding: '0px 20px 20px 20px'}}>
                {mined && <div>
                  Your appointment has been confirmed and is on the blockchain.<br /><br />
                  <a target="_blank" rel="noreferrer" href={`https://goerli.etherscan.io/tx/${transactionHash}`}>View on Etherscan</a>
                  </div>}
              {!mined && !showSign && <div><p>Please wait while we confirm your appoinment on the blockchain....</p></div>}
              {!mined && showSign && <div><p>Please sign the transaction to confirm your appointment.</p></div>}
            </div>
            <div style={{textAlign: 'center', paddingBottom: '30px'}}>
            {!mined && <CircularProgress />}
            </div>
            {mined && 
            <Button onClick={() => {
                setShowDialog(false);
                getData();
              }
              }>Close</Button>}
          </Dialog>
        }

    return <div>
        {isAdmin && <Admin />} 
        <div id="calendar">
            <Scheduler data ={appointments}>
                <ViewState />
                <EditingState onCommitChanges = {saveAppointment}/>
                <WeekView startDayHour={9} endDayHour={19}/>

                <Appointments />
                <AppointmentForm />
            </Scheduler>
        </div>

        {showDialog && <ConfirmDialog />}
    </div>;
}

export default Calendar;