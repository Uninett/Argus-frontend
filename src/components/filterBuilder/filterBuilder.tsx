import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import './FilterBuilder.css';
import moment from 'moment';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import Dialog from '@material-ui/core/Dialog';
import Table from '../react-table/Table';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

type Metadata = { label: string; value: string }[];
const defaultResponse = [{ label: 'none', value: 'none' }];

type Filter = {
  sourceIds: string[];
  objectTypeIds: string[];
  parentObjectIds: string[];
  problemTypeIds: string[];
};

const defaultFilter = {
  sourceIds: [],
  objectTypeIds: [],
  parentObjectIds: [],
  problemTypeIds: [],
};

const networkSystemsResponse: Metadata = [];
const objectTypesResponse: Metadata = [];
const parentObjectsResponse: Metadata = [];
const problemTypesResponse: Metadata = [];

const properties = [
  { propertyName: 'networkSystems', list: networkSystemsResponse },
  { propertyName: 'objectTypes', list: objectTypesResponse },
  { propertyName: 'parentObjects', list: parentObjectsResponse },
  { propertyName: 'problemTypes', list: problemTypesResponse },
];

const FilterBuilder: React.FC = () => {
  const LOADING_TEXT = "Loading...";
  const NO_DATA_TEXT = "No data";
  const NO_MATCHING_ALERTS_TEXT = "No matching alerts";

  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const [name, setName] = useState('');

  const [sourceIds, setSourceIds] = useState<Metadata>(
      defaultResponse
  );
  const [objectTypeIds, setObjectTypeIds] = useState<Metadata>(defaultResponse);
  const [parentObjectIds, setParentObjectIds] = useState<Metadata>(defaultResponse);
  const [problemTypeIds, setProblemTypeIds] = useState<Metadata>(defaultResponse);

  const [previewAlerts, setPreviewAlerts] = useState<any>([]);
  const [noDataText, setNoDataText] = useState<string>(LOADING_TEXT);
  const [showDialog, setShowDialog] = useState<[boolean, string]>([false, '']);

  useEffect(() => {
    fetchProblemTypes();
    getAlerts();
  }, []);

  //fetches alerts and sets state
  const getAlerts = async () => {
    await axios({
      url: 'http://localhost:8000/alerts/',
      method: 'GET',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then((response: any) => {
      for (let item of response.data) {
        item.timestamp = moment(item.timestamp).format('YYYY.MM.DD  hh:mm:ss');
      }
      setNoDataText(response.data.length === 0 ? NO_DATA_TEXT : LOADING_TEXT);
      setPreviewAlerts(response.data);
    });
  };

  const postNewFilter = async () => {
    await axios({
      url: 'http://localhost:8000/notificationprofiles/filters/',
      method: 'POST',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      },
      data: {
        name: name,
        filter_string: JSON.stringify(filter)
      }
    })
      .then(result => {
        if (result.status === 201) {
          setShowDialog([true, ' Successfully saved filter ']);
        }
      })
      .catch(response => {
        setShowDialog([
          true,
          'oops, something went wrong :(, try a different name'
        ]);
      });
  };

  const preview = async () => {
    await axios({
      url: 'http://localhost:8000/notificationprofiles/filterpreview/',
      method: 'POST',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      },
      data: filter
    }).then(response => {
      for (let item of response.data) {
        item.timestamp = moment(item.timestamp).format('YYYY.MM.DD  hh:mm:ss');
      }
      setNoDataText(response.data.length === 0 ? NO_MATCHING_ALERTS_TEXT : LOADING_TEXT);
      setPreviewAlerts(response.data);
    });
  };

  const fetchProblemTypes = async () => {
    await axios({
      url: 'http://localhost:8000/alerts/metadata/',
      method: 'GET',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token')
      }
    }).then(result => {
      properties.map(p => {
        return result.data[p.propertyName].map((obj: any) => {
          return p.list.push({
            label: obj.name,
            value: obj.pk
          });
        });
      });
    });
    setSourceIds(networkSystemsResponse);
    setParentObjectIds(parentObjectsResponse);
    setObjectTypeIds(objectTypesResponse);
    setProblemTypeIds(problemTypesResponse);
  };

  const handleChange = (value: any, property: string) => {
    let newFilter: any = filter;
    newFilter[property] = value
      ? value.map((obj: any) => {
          return obj.value;
        })
      : [];
    setFilter(newFilter);
  };

  const handleName = (e: any) => {
    setName(e.target.value);
    console.log(name);
  };

  const handleCreate = () => {
    if (name === '') {
      alert('Please enter a name for this filter');
    } else {
      postNewFilter();
    }
  };
  const handleClose = () => {
    setShowDialog([false, '']);
  };

  return (
    <div className='WrappingDiv'>
      <Dialog open={showDialog[0]} onClose={handleClose}>
        <h1 className='dialogHeader'>{showDialog[1]}</h1>
        <div className='dialogDiv'>
          {showDialog[1] === ' Successfully saved filter ' ? (
            <CheckCircleIcon color={'primary'} />
          ) : (
            ''
          )}
        </div>
      </Dialog>
      <div className='filterBuilding-div'>
        <div className='InputWrapperDiv'>
          <div className='filterSelect'>
            <p>Name</p>
            <div className='NameFieldDiv'>
              <TextField
                required
                id='standard-required'
                label='Required'
                defaultValue=''
                placeholder='name'
                onChange={handleName}
                margin='dense'
              />
            </div>
          </div>
          <div className='filterSelect'>
            <p>Select problem types</p>
            <Select
              className='selector'
              isMulti
              name='bois'
              options={problemTypeIds}
              onChange={value => handleChange(value, 'problemTypeIds')}></Select>
          </div>
          <div className='filterSelect'>
            <p>Select object types</p>
            <Select
              className='selector'
              isMulti
              name='boiss'
              options={objectTypeIds}
              onChange={value => handleChange(value, 'objectTypeIds')}></Select>
          </div>
          <div className='filterSelect'>
            <p>Select parent objects</p>
            <Select
              className='selector'
              isMulti
              name='boisss'
              options={parentObjectIds}
              onChange={value => handleChange(value, 'parentObjectIds')}></Select>
          </div>
          <div className='filterSelect'>
            <p>Select network systems</p>
            <Select
              className='selector'
              isMulti
              name='boissss'
              options={sourceIds}
              onChange={value =>
                handleChange(value, 'sourceIds')
              }></Select>
          </div>
          <div className='ButtonDiv'>
            <div className='create'>
              <Button
                onClick={handleCreate}
                variant='contained'
                color='primary'
                size='large'
                startIcon={<SaveIcon />}>
                create
              </Button>
            </div>
            <div className='preview'>
              <Button
                onClick={preview}
                variant='contained'
                color='primary'
                size='large'>
                Preview Alerts
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className='previewList'>
        <Table alerts={previewAlerts} noDataText={noDataText} />
      </div>
    </div>
  );
};

export default FilterBuilder;
