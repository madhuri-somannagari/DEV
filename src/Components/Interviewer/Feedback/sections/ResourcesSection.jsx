import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Resources } from "../../../../assets";
import {
  FormRow,
  FormSection,
  FileUpload,
  LinkInput,
} from "../FeedbackComponents";
import { WEBSITE_REGEX } from "../../../Constants/constants";
import { createFileFromUrl } from "../../../../utils/util";

const ResourcesSection = ({
  register,
  errors,
  setValue,
  trigger,
  watch,
  getValues,
}) => {
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);

  // Watch for changes in the resources values
  const resources = watch("resources");
  const attachmentUrl = watch("attachmentUrl");

  // Handle file change from upload
  const handleFileChange = (file) => {
    setValue("resources.file", file, {
      shouldValidate: true,
    });

    // Clear resource validation errors when a file is added
    if (file) {
      trigger("resources.file");
    }
  };

  // Load existing attachment if available
  useEffect(() => {
    const loadExistingAttachment = async () => {
      // Skip if we don't have an attachment URL or already have a file loaded
      if (!attachmentUrl || resources.file) return;

      setIsFileLoading(true);
      setFileError(null);

      try {
        // Convert the URL to a File object
        const file = await createFileFromUrl(attachmentUrl);
        // Set the file in the form data
        setValue("resources.file", file, {
          shouldValidate: true,
        });
      } catch (error) {
        console.error("Error loading attachment:", error);
        setFileError(
          "Could not load the attached file. Please re-upload if needed."
        );
      } finally {
        setIsFileLoading(false);
      }
    };

    loadExistingAttachment();
  }, [attachmentUrl, resources.file, setValue]);

  return (
    <FormSection
      title="Additional Resources"
      subtitle="Upload Files or Provide External Links Related to this Feedback"
      icon={Resources}
      data-error-section="resources"
    >
      <FormRow>
        <FileUpload
          label="Upload File"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          {...register("resources.file")}
          error={
            fileError
              ? { message: fileError }
              : errors.resources?.file
          }
          onChange={handleFileChange}
          isLoading={isFileLoading}
          defaultFileName={
            attachmentUrl
              ? attachmentUrl.split("/").pop().split("?")[0]
              : null
          }
          data-error-key="resources.file"
        />

        <LinkInput
          label="Resource Link"
          placeholder="Enter website URL (e.g., https://example.com)"
          {...register("resources.link", {
            validate: {
              validUrl: (value) => {
                if (!value) return true; // Optional field
                return (
                  WEBSITE_REGEX.test(value) ||
                  "Please enter a valid URL"
                );
              },
            },
          })}
          error={errors.resources?.link}
          onBlur={() => {
            trigger("resources.link");
            // If valid link is entered, clear any resource validation errors
            const link = getValues("resources.link");
            if (link && WEBSITE_REGEX.test(link)) {
              trigger("resources.file");
            }
          }}
          data-error-key="resources.link"
        />
      </FormRow>
    </FormSection>
  );
};

ResourcesSection.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  setValue: PropTypes.func.isRequired,
  trigger: PropTypes.func.isRequired,
  watch: PropTypes.func.isRequired,
  getValues: PropTypes.func.isRequired,
};

export default ResourcesSection;
