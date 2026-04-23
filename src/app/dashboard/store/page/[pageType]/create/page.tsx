"use client";

import { useParams } from "next/navigation";
import LandingPageEditorClient from "../../../../../../components/store/LandingPageEditorClient";

export default function CreateLandingPageEditor() {
  const params = useParams();
  const pageType = typeof params?.pageType === "string" ? params.pageType : "link-page";
  return <LandingPageEditorClient pageType={pageType} />;
}
