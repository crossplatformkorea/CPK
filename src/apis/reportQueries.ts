import {supabase} from '../supabase';
import {ReportInsertArgs} from '../types';

export const fetchCreateReport = async (report: ReportInsertArgs) => {
  const {data, error} = await supabase.from('reports').insert(report).single();

  console.log('fetchCreateReport', data);
  console.log('fetchCreateReport', error);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
