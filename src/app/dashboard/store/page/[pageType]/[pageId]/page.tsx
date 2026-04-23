"use client";

import { useParams } from "next/navigation";
import LandingPageEditorClient from "../../../../../../components/store/LandingPageEditorClient";

export default function EditLandingPageEditor() {
  const params = useParams();
  const pageType = typeof params?.pageType === "string" ? params.pageType : "link-page";
  const pageId = typeof params?.pageId === "string" ? params.pageId : "";
  return <LandingPageEditorClient pageType={pageType} pageId={pageId} />;
}
