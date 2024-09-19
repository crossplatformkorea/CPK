import {SupabaseClient} from '../hooks/useSupabase';
import {ReportInsertArgs} from '../types';

export const fetchCreateReport = async ({
  report,
  supabase,
}: {
  report: ReportInsertArgs;
  supabase: SupabaseClient;
}) => {
  const {data, error} = await supabase.from('reports').insert(report).single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
