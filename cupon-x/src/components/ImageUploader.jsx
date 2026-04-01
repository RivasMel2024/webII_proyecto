import { useState } from 'react';
import { supabase } from '../services/supabaseClient'; 
import { Button, Spinner } from 'react-bootstrap';
import { FaCloudUploadAlt } from 'react-icons/fa';

const ImageUploader = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Subir al Bucket
      let { error: uploadError } = await supabase.storage
        .from('cupones-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener la URL Pública
      const { data } = supabase.storage
        .from('cupones-images')
        .getPublicUrl(filePath);

      onUploadSuccess(data.publicUrl);
    } catch (error) {
      alert('Error subiendo imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-3">
      <label className="btn btn-outline-primary w-100">
        {uploading ? <Spinner size="sm" /> : <FaCloudUploadAlt className="me-2" />}
        {uploading ? 'Subiendo...' : 'Subir Imagen del Cupón'}
        <input 
          type="file" 
          hidden 
          accept="image/*" 
          onChange={uploadImage} 
          disabled={uploading} 
        />
      </label>
    </div>
  );
};

export default ImageUploader;