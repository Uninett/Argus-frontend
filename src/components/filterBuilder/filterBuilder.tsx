import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './FilterBuilder.css';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import Dialog from '@material-ui/core/Dialog';
import Table from '../react-table/Table';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import api, {Alert, AlertMetadata, Filter, FilterDefinition} from '../../api'
import {AlertWithFormattedTimestamp, alertWithFormattedTimestamp} from '../../utils'


type NameAndPK = { pk: string | number, name: string }
type Metadata = { label: string; value: string | number };
const defaultResponse = [{ label: 'none', value: 'none' }];


const defaultFilter: FilterDefinition = {
  sourceIds: [],
  objectTypeIds: [],
  parentObjectIds: [],
  problemTypeIds: [],
};

const alertSourcesResponse: Metadata[] = [];
const objectTypesResponse: Metadata[] = [];
const parentObjectsResponse: Metadata[] = [];
const problemTypesResponse: Metadata[] = [];

function mapToMetadata<T extends NameAndPK>(meta: T): Metadata {
    return {label: meta.name, value: meta.pk}
}

const FilterBuilder: React.FC = () => {
  const LOADING_TEXT = "Loading...";
  const NO_DATA_TEXT = "No data";
  const NO_MATCHING_ALERTS_TEXT = "No matching alerts";

  const [filter, setFilter] = useState<FilterDefinition>(defaultFilter);
  const [name, setName] = useState<string>('');

  const [sourceIds, setSourceIds] = useState<Metadata[]>(
      defaultResponse
  );
  const [objectTypeIds, setObjectTypeIds] = useState<Metadata[]>(defaultResponse);
  const [parentObjectIds, setParentObjectIds] = useState<Metadata[]>(defaultResponse);
  const [problemTypeIds, setProblemTypeIds] = useState<Metadata[]>(defaultResponse);

  const [previewAlerts, setPreviewAlerts] = useState<AlertWithFormattedTimestamp[]>([]);
  const [noDataText, setNoDataText] = useState<string>(LOADING_TEXT);
  const [showDialog, setShowDialog] = useState<[boolean, string]>([false, '']);

  useEffect(() => {
    fetchProblemTypes();
    getAlerts();
  }, []);

  const getAlerts = (filter?: FilterDefinition) => {
    const promise = (filter && api.postFilterPreview(filter)) || api.getAllAlerts()
    promise.then((alerts: Alert[]) => {
        const formattedAlerts = alerts.map(alertWithFormattedTimestamp)
        setNoDataText(alerts.length === 0 ? NO_DATA_TEXT : LOADING_TEXT)
        setPreviewAlerts(formattedAlerts)
    })
  }

  const postNewFilter = async () => {
    await api.postFilter(name, JSON.stringify(filter)).then((filter: Filter) => {
        setShowDialog([true, ' Successfully saved filter ']);
    }).catch(error => {
        setShowDialog([ true, `Unable to create filter: ${name}. Try using a different name` ]);
        console.log(error)
    })
  }

  const preview = async () => { await getAlerts(filter) };

  const fetchProblemTypes = async () => {
    await api.getAllAlertsMetadata().then((alertMetadata: AlertMetadata): AlertMetadata => {
        // TODO: is all of this necessary?
        alertMetadata.alertSources.map(mapToMetadata).forEach((m: Metadata) => alertSourcesResponse.push(m))
        alertMetadata.objectTypes.map(mapToMetadata).forEach((m: Metadata) => objectTypesResponse.push(m))
        alertMetadata.parentObjects.map(mapToMetadata).forEach((m: Metadata) => parentObjectsResponse.push(m))
        alertMetadata.problemTypes.map(mapToMetadata).forEach((m: Metadata) => problemTypesResponse.push(m))

        setSourceIds(alertSourcesResponse)
        setParentObjectIds(parentObjectsResponse)
        setObjectTypeIds(objectTypesResponse)
        setProblemTypeIds(problemTypesResponse)

        return alertMetadata
    })
  }

  const handleChange = (value: any, property: string) => {
    const newFilter: any = filter;
    newFilter[property] = value
      ? value.map((obj: any) => {
          return obj.value;
        })
      : [];
    setFilter(newFilter);
  };

  const handleName = (e: any) => {
    setName(e.target.value);
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
            <p>Select alert sources</p>
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
